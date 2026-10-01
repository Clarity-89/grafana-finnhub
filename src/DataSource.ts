import { from, merge, Observable } from 'rxjs';
import {
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  ScopedVars,
  TimeRange,
} from '@grafana/data';
import { config, getBackendSrv, getTemplateSrv, isFetchError } from '@grafana/runtime';
import { genericFrames } from './frames';
import { normalizeQuery, QueryParams, QueryTypeDef, queryTypes, RestQueryType } from './queryTypes';
import { streamTrades } from './streamTrades';
import { MyDataSourceOptions, MyQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  readonly url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
  }

  query(request: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const streams: Array<Observable<DataQueryResponse>> = [];
    const requests: Array<Promise<DataFrame[]>> = [];
    for (const target of request.targets.filter((target) => !target.hide)) {
      const query = this.interpolate(target, request.scopedVars);
      const def: QueryTypeDef = queryTypes[query.type];
      if ('stream' in def) {
        streams.push(streamTrades(this.webSocketUrl(), query.symbol, query.refId));
      } else {
        requests.push(this.fetchFrames(query, def, request.range));
      }
    }
    return merge(...streams, from(Promise.all(requests).then((frames) => ({ data: frames.flat() }))));
  }

  async testDatasource() {
    try {
      await this.get('stock/profile2', { symbol: 'AAPL' });
      return { status: 'success', message: 'Data source is working' };
    } catch (e) {
      // Grafana's proxy reports auth failures as { message }; Finnhub reports its own errors as { error }.
      const reason = isFetchError<{ message?: string; error?: string }>(e)
        ? e.data?.message ?? e.data?.error ?? e.statusText
        : String(e);
      return { status: 'error', message: `Error retrieving data: ${reason}` };
    }
  }

  private interpolate(target: MyQuery, scopedVars: ScopedVars): MyQuery {
    const query = normalizeQuery(target);
    return { ...query, symbol: getTemplateSrv().replace(query.symbol, scopedVars).toUpperCase() };
  }

  private async fetchFrames(query: MyQuery, def: RestQueryType, range: TimeRange): Promise<DataFrame[]> {
    if (query.queryText) {
      return genericFrames(await this.get(query.queryText), query.refId);
    }
    return def.toFrames(await this.get(def.path, def.params(query, range)), query.refId);
  }

  private get(path: string, params?: QueryParams): Promise<unknown> {
    return getBackendSrv().get<unknown>(`${this.url}/api/${path}`, params);
  }

  private webSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const base = `${protocol}//${window.location.host}${config.appSubUrl}`.replace(/\/$/, '');
    return `${base}${this.url}/ws`;
  }
}
