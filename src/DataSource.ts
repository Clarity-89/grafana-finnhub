import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings, MutableDataFrame, FieldType } from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  dataSourceName: string;
  token: string;
  baseUrl: string;
  websocketUrl: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.dataSourceName = instanceSettings.name;
    const config = instanceSettings.jsonData;
    this.token = config.apiToken;
    this.baseUrl = `https://finnhub.io/api/v1/stock`;
    this.websocketUrl = `wss://ws.finnhub.io?token=${this.token}`;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map(target => {
      const query = {...target, ...defaultQuery};
      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
        ],
      });
    });

    return { data };
  }

  async testDatasource() {
    // Implement a health check for your data source.

    return {
      status: 'success',
      message: 'Success',
    };
  }
}
