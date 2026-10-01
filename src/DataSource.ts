import { from, merge, Observable } from 'rxjs';
import {
  AnnotationSupport,
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataSourceVariableSupport,
  ScopedVars,
  TimeRange,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv, isFetchError } from '@grafana/runtime';
import { genericFrames } from './frames';
import { isStream, normalizeQuery, QueryParams, QueryTypeDef, queryTypes, RestQueryType } from './queryTypes';
import { streamTrades } from './streamTrades';
import { MyDataSourceOptions, MyQuery } from './types';

export interface SymbolMatch {
  symbol: string;
  displaySymbol: string;
  description: string;
}

/** Query variables run the regular query editor and take the first string field as options. */
class FinnhubVariables extends DataSourceVariableSupport<DataSource> {}

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  readonly url?: string;

  /** Standard Grafana annotation processing over our frames. */
  annotations: AnnotationSupport<MyQuery> = {
    getDefaultQuery: () => ({ type: 'company-news' }),
    prepareQuery: (anno) => (anno.target && !isStream(normalizeQuery(anno.target)) ? anno.target : undefined),
  };

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
    this.variables = new FinnhubVariables();
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

  /** Finnhub symbol search. Blank text and template expressions are not looked up; request failures propagate so the picker can show them. */
  async searchSymbols(text: string): Promise<SymbolMatch[]> {
    const q = text.trim();
    if (!q || getTemplateSrv().containsTemplate(q)) {
      return [];
    }
    const { result } = await this.get<{ result?: SymbolMatch[] }>('search', { q });
    return result ?? [];
  }

  private interpolate(target: MyQuery, scopedVars: ScopedVars): MyQuery {
    const query = normalizeQuery(target);
    const replace = (value: string) => getTemplateSrv().replace(value, scopedVars);
    return {
      ...query,
      symbol: replace(query.symbol).toUpperCase(),
      search: replace(query.search),
      exchange: replace(query.exchange),
      category: replace(query.category),
    };
  }

  private async fetchFrames(query: MyQuery, def: RestQueryType, range: TimeRange): Promise<DataFrame[]> {
    if (query.queryText) {
      return genericFrames(await this.get(query.queryText), query.refId);
    }
    return def.toFrames(await this.get(def.path, def.params(query, range)), query.refId);
  }

  private get<T = unknown>(path: string, params?: QueryParams): Promise<T> {
    return getBackendSrv().get<T>(`${this.url}/api/${path}`, params);
  }

  /** Grafana serves under `<base href="<appSubUrl>/">`, so resolving the proxy path against it mirrors backendSrv. */
  private webSocketUrl() {
    const url = new URL(`${this.url}/ws`.replace(/^\//, ''), document.baseURI);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  }
}
