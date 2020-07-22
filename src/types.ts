import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';

export enum TargetType {
  Timeseries = 'TIMESERIES',
  Table = 'TABLE',
}
export interface MyQuery extends DataQuery {
  queryText?: string;
  symbol?: string;
  type: SelectableValue;
  format: TargetType;
  metric: SelectableValue;
  count?: number;
  resolution?: number | string;
}

export interface CandleQuery {
  symbol: string;
  count: number;
  resolution: number | string;
}

export const defaultQuery: Partial<MyQuery | CandleQuery> = {
  type: { value: 'profile2', label: 'Profile' },
  format: TargetType.Timeseries,
  count: 1000,
  resolution: 1,
  symbol: '',
  metric: { value: 'price', label: 'price' },
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
  apiToken: string;
}

export interface QueryParams {
  symbol?: string;
  limit?: number;
  [key: string]: any;
}
