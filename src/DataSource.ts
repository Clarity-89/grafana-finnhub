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
    switch (target.queryType?.value) {
      case 'candle': {
        const { resolution } = target;
        return { symbol, resolution, from: range.from.unix(), to: range.to.unix() };
      }

      default: {
        return {
          symbol,
        };
      }
    }
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { targets, range } = options;
    const promises = targets.map(target => {
      const targetWithDefaults = { ...defaultQuery, ...target };
      const { queryText, queryType } = targetWithDefaults;
      let request;
      // Ignore other query params if there's a free text query
      if (queryText) {
        request = this.freeTextQuery(queryText);
      } else {
        const query = this.constructQuery({ ...defaultQuery, ...target }, range as TimeRange);
        request = this.get(queryType.value, query);
      }

      // Combine received data and its target
      return request.then(data => {
        const isTable = getTargetType(queryType) === TargetType.Table;
        return isTable ? this.tableResponse(data) : this.tsResponse(data, queryType.value);
      });
    });
    const data = await Promise.all(promises);
    return { data: data.flat() };
  }

  tableResponse = (data: any) => {
    return {
      columns: Object.entries(data).map(([key, val]) => ({
        text: key,
        type: typeof val === 'string' ? 'string' : 'number',
      })),
      rows: [Object.values(data).map(val => val)],
      type: 'table',
    };
  };

  // Timeseries response
  tsResponse(data: any, type: string): TimeSeries[] {
    switch (type) {
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
            datapoints: [[data.c, data.t * 1000]],
          },
        ];
      case 'candle':
        const fields = ['open price', 'close price'];

        return fields.map(field => ({
          target: field,
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
