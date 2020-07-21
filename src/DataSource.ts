import { from, merge, Observable } from 'rxjs';
import {
  CircularDataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  dateTime,
  FieldType,
  MutableDataFrame,
  TimeRange,
} from '@grafana/data';
import { BackendSrv as BackendService } from '@grafana/runtime';

import { CandleQuery, defaultQuery, MyDataSourceOptions, MyQuery, QueryParams, TargetType } from './types';
import { getTargetType } from './utils';
import { candleFields } from './constants';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  dataSourceName: string;
  token: string;
  baseUrl: string;
  websocketUrl: string;

  /** @ngInject */
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: BackendService) {
    super(instanceSettings);
    this.dataSourceName = instanceSettings.name;
    const config = instanceSettings.jsonData;
    this.token = config.apiToken;
    this.baseUrl = `https://finnhub.io/api/v1`;
    this.websocketUrl = `wss://ws.finnhub.io?token=${this.token}`;
  }

  constructQuery(target: Partial<MyQuery & CandleQuery>, range: TimeRange) {
    const symbol = target.symbol?.toUpperCase();
    const { refId } = target;
    switch (target.type?.value) {
      case 'candle': {
        const { resolution } = target;
        return { symbol, resolution, from: range.from.unix(), to: range.to.unix(), refId };
      }
      case 'metric':
        return { symbol, metric: target?.metric?.value, refId };
      default:
        return {
          symbol,
          refId,
        };
    }
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const { targets, range } = options;
    const visibleTargets = targets.filter(target => !target.hide);
    const streams = visibleTargets
      .filter(target => target.type?.value === 'trades')
      .map(target => {
        const targetWithDefaults = { ...defaultQuery, ...target };
        const query = this.constructQuery(targetWithDefaults, range as TimeRange);
        return new Observable<DataQueryResponse>(subscriber => {
          const frame = new CircularDataFrame({
            append: 'tail',
            capacity: 1000,
          });

          frame.refId = query.refId;
          frame.addField({ name: 'ts', type: FieldType.time });
          frame.addField({ name: 'value', type: FieldType.number });

          const socket = new WebSocket(this.websocketUrl);
          socket.onopen = () => socket.send(JSON.stringify({ type: 'subscribe', symbol: query.symbol }));
          socket.onerror = (error: any) => console.log(`WebSocket error: ${JSON.stringify(error)}`);
          socket.onclose = () => subscriber.complete();
          socket.onmessage = (event: MessageEvent) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'trade') {
                const { t, p } = data.data[0];
                frame.add({ ts: t, value: p });

                subscriber.next({
                  data: [frame],
                  key: query.refId,
                });
              }
            } catch (e) {
              console.error(e);
            }
          };

          return () => {
            socket.send(JSON.stringify({ type: 'unsubscribe', symbol: query.symbol }));
            socket.close();
          };
        });
      });
    const promises = visibleTargets
      .filter(target => target.type?.value !== 'trades')
      .map(target => {
        const targetWithDefaults = { ...defaultQuery, ...target };
        let request;
        const { queryText, type } = targetWithDefaults;
        // Ignore other query params if there's a free text query
        if (queryText) {
          request = this.freeTextQuery(queryText);
        } else {
          const query = this.constructQuery({ ...defaultQuery, ...target }, range as TimeRange);
          request = this.get(type.value, query);
        }

        // Combine received data and its target
        return request.then(data => {
          const isTable = getTargetType(type) === TargetType.Table;
          if (data.metric) {
            data = data.metric;
          }
          return isTable ? this.tableResponse(data, target) : this.tsResponse(data, target);
        });
      });

    const observable = from(Promise.all(promises).then(data => ({ data: data.flat() })));
    return merge(...streams, observable);
  }

  tableResponse = (data: any, target: MyQuery) => {
    // Empty data frame
    if (!data) {
      return [
        new MutableDataFrame({
          refId: target.refId,
          fields: [
            {
              name: 'no data',
              type: FieldType.string,
              values: [],
            },
          ],
          meta: {
            preferredVisualisationType: 'table',
          },
        }),
      ];
    }

    return [
      new MutableDataFrame({
        refId: target.refId,
        fields: Object.entries(data).map(([key, val]) => ({
          name: key,
          type: typeof val === 'string' ? FieldType.string : FieldType.number,
          values: [val],
        })),
        meta: {
          preferredVisualisationType: 'table',
        },
      }),
    ];
  };

  // Timeseries response
  tsResponse(data: any, target: MyQuery) {
    switch (target.type.value) {
      case 'earnings': {
        const excludedFields = ['symbol'];
        const timeKey = 'period';
        const keys = Object.keys(data[0]).filter(key => !excludedFields.includes(key));
        return [
          new MutableDataFrame({
            refId: target.refId,
            fields: keys.map(key => ({
              type: key === timeKey ? FieldType.time : FieldType.number,
              name: key,
              values: data.map((dp: any) => (key === timeKey ? dateTime(dp[key]).valueOf() : dp[key])),
            })),
            meta: {
              preferredVisualisationType: 'graph',
            },
          }),
        ];
      }
      case 'quote':
        return [
          {
            target: 'current price',
            datapoints: [[data.c, data.t * 1000]],
          },
        ];
      case 'candle':
        return [...candleFields].map(([field, label]) => ({
          target: field,
          title: label,
          datapoints: data.t.map((time: any, i: number) => [data[field.charAt(0)][i], time * 1000]),
        }));
      default:
        return [];
    }
  }

  async testDatasource() {
    const resp = await this.get('profile', { symbol: 'AAPL' });
    if (resp.status === 200) {
      return { status: 'success' };
    }
    return { status: 'error' };
  }

  async freeTextQuery(query: string) {
    try {
      return await this.backendSrv.get(`${this.baseUrl}/${query}&token=${this.token}`);
    } catch (e) {
      console.error('Error retrieving data', e);
    }
  }

  async get(dataType: string, params: QueryParams = {}) {
    const url = `${this.baseUrl}${dataType === 'quote' ? '' : '/stock'}`;
    try {
      return await this.backendSrv.get(`${url}/${dataType}`, {
        ...params,
        token: this.token,
      });
    } catch (e) {
      console.error('Error retrieving data', e);
      throw e;
    }
  }
}
