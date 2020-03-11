import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  TimeSeries,
  TimeRange,
} from '@grafana/data';
import { BackendSrv as BackendService } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery, TargetType, QueryParams, CandleQuery } from './types';
import { getTargetType } from './utils';

// const dataExtractors = {
//   //@ts-ignore
//   candle: ({ data }) => data.t.map((time, i) => [data.o[i], time]),
//   earnings: (target: any) => {
//     const excludedFields = ['period', 'symbol'];
//     const keys = Object.keys(target.data[0]).filter(key => !excludedFields.includes(key));
//     return keys.map(key => {
//       return {
//         target: key,
//         datapoints: target.data.map((dp: any) => [dp[key], new Date(dp.period).getTime()]),
//       };
//     });
//   },
// };
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
    this.baseUrl = `https://finnhub.io/api/v1/`;
    this.websocketUrl = `wss://ws.finnhub.io?token=${this.token}`;
  }

  constructQuery(target: Partial<MyQuery & CandleQuery>, range: TimeRange) {
    const symbol = target.symbol?.toUpperCase();
    let query;
    switch (target.queryType?.value) {
      case 'candle': {
        const { resolution } = target;
        query = { symbol, resolution, from: range.from.unix(), to: range.to.unix() };
        break;
      }

      default: {
        query = {
          symbol,
        };
      }
    }
    return [query, target.queryType?.value];
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { targets, range } = options;
    console.log('t', targets);
    //@ts-ignore
    const promises = targets.flatMap(target => {
      const { queryText } = target;
      // Ignore other query params if there's a free text query
      if (queryText) {
        return this.freeTextQuery(queryText).then(data => ({
          ...target,
          data,
        }));
      }

      const [query, queryType] = this.constructQuery({ ...defaultQuery, ...target }, range as TimeRange);
      // Combine received data and its target
      return query.symbol
        ?.split(',')
        .map((symbol: string) => this.get(queryType, { ...query, symbol }).then(data => ({ ...target, data })));
    });

    const data = await Promise.all(promises);
    const isTable = targets.some(target => getTargetType(target.queryType) === TargetType.Table);
    return { data: isTable ? this.tableResponse(data) : this.tsResponse(data[0]) };
  }

  tableResponse = (targets: any[]) => {
    return targets.map(target => {
      return {
        columns: Object.entries(target.data).map(([key, val]) => ({
          text: key,
          type: typeof val === 'string' ? 'string' : 'number',
        })),
        rows: [Object.values(target.data).map(val => val)],
        type: 'table',
      };
    });
  };

  // Timeseries response
  tsResponse(target: any): TimeSeries[] {
    const { data } = target;
    switch (target.queryType?.value) {
      case 'earnings': {
        const excludedFields = ['period', 'symbol'];
        const keys = Object.keys(data[0]).filter(key => !excludedFields.includes(key));
        return keys.map(key => {
          return {
            target: key,
            datapoints: data.map((dp: any) => [dp[key], new Date(dp.period).getTime()]),
          };
        });
      }
      case 'quote':
        return [
          {
            target: 'current price',
            datapoints: [data.c, data.t],
          },
        ];
      case 'candle':
        return [
          {
            target: 'open price',
            datapoints: data.t.map((time: any, i: number) => [data.o[i], time * 1000]),
          },
        ];
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
