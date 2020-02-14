import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';
import { BackendSrv as BackendService } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, defaultQuery, TargetType, QueryParams } from './types';
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
    this.baseUrl = `https://finnhub.io/api/v1/stock`;
    this.websocketUrl = `wss://ws.finnhub.io?token=${this.token}`;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { targets } = options;
    //@ts-ignore
    const promises = targets.flatMap(target => {
      const query = { ...defaultQuery, ...target };
      const { queryText } = target;
      // Ignore other query params if there's a free text query
      if (queryText) {
        return this.freeTextQuery(queryText).then(data => ({ ...target, data }));
      }
      // Combine received data and its target
      return query.symbol
        ?.split(',')
        .map((sym: string) => this.get(query.queryType.value, { symbol: sym?.toUpperCase() }).then(data => ({ ...target, data })));
    });

    const data = await Promise.all(promises);
    const isTable = targets.some(target => getTargetType(target.queryType) === TargetType.Table);
    return { data: isTable ? this.tableResponse(data) : this.tsResponse(data) };
  }

  tableResponse = (targets: any[]) => {
    return targets.map(target => {
      return {
        columns: Object.entries(target.data).map(([key, val]) => ({ text: key, type: typeof val === 'string' ? 'string' : 'number' })),
        rows: [Object.values(target.data).map(val => val)],
        type: 'table',
      };
    });
  };

  // Timeseries response
  tsResponse(targets: any[]) {
    const d = targets.map(target => {
      const keys = Object.keys(target.data[0]).filter(key => key !== 'period' && key !== 'symbol');
      return keys.map(key => {
        return { target: key, datapoints: target.data.map((dp: any) => [dp[key], new Date(dp.period).getTime()]) };
      });
    });
    return d[0];
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
    try {
      return await this.backendSrv.get(`${this.baseUrl}/${dataType}`, { ...params, token: this.token });
    } catch (e) {
      console.error('Error retrieving data', e);
      throw e;
    }
  }
}
