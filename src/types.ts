import { DataSourceJsonData, SelectableValue } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export type QueryType = 'quote' | 'earnings' | 'candle' | 'trades' | 'social-sentiment' | 'profile2' | 'metric';

export interface MyQuery extends DataQuery {
  type: QueryType;
  symbol: string;
  /** Candle bar size: minutes as a number string, or D / W / M. */
  resolution: string;
  /** Metric group for the `metric` endpoint. */
  metric: string;
  /** Raw path and query string under /api/v1. Overrides every other field when set. */
  queryText?: string;
}

/**
 * Any shape the plugin has ever persisted. Versions before 0.8 stored Select options
 * instead of plain values and carried fields nothing read.
 */
export interface SavedQuery extends DataQuery {
  type?: QueryType | SelectableValue<string>;
  symbol?: string;
  resolution?: number | string;
  metric?: string | SelectableValue<string>;
  queryText?: string;
  format?: string;
  count?: number;
}

export const defaultQuery: Omit<MyQuery, 'refId'> = {
  type: 'profile2',
  symbol: '',
  resolution: '1',
  metric: 'price',
};

export type MyDataSourceOptions = DataSourceJsonData;

export interface SecureJsonData {
  apiToken?: string;
}
