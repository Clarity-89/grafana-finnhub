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
import { ensureArray, getTargetType } from './utils';
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

  tableResponse = (data: any, target: MyQuery): MutableDataFrame[] => {
    // Empty data frame
    if (!data || data.s === 'no_data') {
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
  tsResponse(data: any, target: MyQuery): MutableDataFrame[] {
    const { refId } = target;
    const emptyDf = [
      new MutableDataFrame({
        refId,
        fields: [
          {
            name: 'no data',
            type: FieldType.string,
            values: [],
          },
        ],
        meta: {
          preferredVisualisationType: 'graph',
        },
      }),
    ];

    if (data?.s === 'no_data' || typeof data === 'string') {
      return emptyDf;
    }

    switch (target.type.value) {
      case 'earnings': {
        const excludedFields = ['symbol'];
        const timeKey = 'period';
        const keys = Object.keys(data[0]).filter(key => !excludedFields.includes(key));
        return [
          new MutableDataFrame({
            refId,
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
      case 'quote': {
        const timeKey = 't';
        const fields = new Map([
          ['t', 'time'],
          ['c', 'current price'],
        ]);
        return [
          new MutableDataFrame({
            refId,
            fields: [...fields].map(([key, label]) => ({
              type: key === timeKey ? FieldType.time : FieldType.number,
              name: label,
              values: key === timeKey ? [data[key] * 1000] : [data[key]],
            })),
            meta: {
              preferredVisualisationType: 'table',
            },
          }),
        ];
      }
      case 'candle': {
        const timeKey = 't';
        return [
          new MutableDataFrame({
            refId,
            fields: [...candleFields].map(([key, label]) => {
              return {
                type: key === timeKey ? FieldType.time : FieldType.number,
                name: key,
                title: label,
                values: key === timeKey ? data[key].map((val: number) => val * 1000) : data[key],
              };
            }),
            meta: {
              preferredVisualisationType: 'graph',
            },
          }),
        ];
      }
      default:
        const timeKeys = ['t', 'time', 'period'];
        return [
          new MutableDataFrame({
            refId,
            fields: Object.entries(data).map(([key, value]) => {
              return {
                type: timeKeys.includes(key) ? FieldType.time : (typeof value as FieldType),
                name: key,
                values: timeKeys.includes(key)
                  ? ensureArray(value).map((val: number) => val * 1000)
                  : ensureArray(value),
              };
            }),
          }),
        ];
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
      return await this.backendSrv.get(`${this.baseUrl}/${query}`, { token: this.token });
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
