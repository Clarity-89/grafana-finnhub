import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';

export enum TargetType {
  Timeseries = 'TIMESERIES',
  Table = 'TABLE',
}
export interface MyQuery extends DataQuery {
  queryText?: string;
  symbol?: string;
  queryType: SelectableValue; // TODO think of a more appropriate name
  type: TargetType;
}

export const defaultQuery: Partial<MyQuery> = {
  queryType: { value: 'profile', label: 'Profile' },
  type: TargetType.Timeseries,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
  apiToken: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export interface QueryParams {
  symbol?: string;
  limit?: number;
  [key: string]: any;
}
