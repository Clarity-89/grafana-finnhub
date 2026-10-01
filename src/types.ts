import { DataSourceJsonData, SelectableValue } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export type QueryType =
  | 'quote'
  | 'profile2'
  | 'earnings'
  | 'metric'
  | 'recommendation'
  | 'company-news'
  | 'market-news'
  | 'filings'
  | 'insider-sentiment'
  | 'insider-transactions'
  | 'earnings-calendar'
  | 'ipo-calendar'
  | 'market-holiday'
  | 'market-status'
  | 'symbol-lookup'
  | 'peers'
  | 'trades'
  | 'candle'
  | 'social-sentiment';

/** Editor inputs a query type uses; each is the `MyQuery` field of the same name. */
export type QueryInput = 'symbol' | 'search' | 'resolution' | 'metric' | 'exchange' | 'category';

export interface MyQuery extends DataQuery {
  type: QueryType;
  symbol: string;
  /** Symbol lookup term: ticker, company name, ISIN or CUSIP. */
  search: string;
  /** Candle bar size: minutes as a number string, or D / W / M. */
  resolution: string;
  /** Metric group for the `metric` endpoint. */
  metric: string;
  /** Finnhub exchange code for market status and holidays, e.g. `US`. */
  exchange: string;
  /** Market news category: `general`, `forex`, `crypto` or `merger`. */
  category: string;
  /** Raw path and query string under /api/v1. Overrides every other field when set. */
  queryText?: string;
}

/**
 * Any shape the plugin has ever persisted. Versions before 1.0 stored Select options
 * instead of plain values and carried fields nothing read.
 */
export interface SavedQuery extends DataQuery {
  type?: QueryType | SelectableValue<string>;
  symbol?: string;
  search?: string;
  resolution?: number | string;
  metric?: string | SelectableValue<string>;
  exchange?: string;
  category?: string;
  queryText?: string;
  format?: string;
  count?: number;
}

export const defaultQuery: Omit<MyQuery, 'refId'> = {
  type: 'profile2',
  symbol: '',
  search: '',
  resolution: '1',
  metric: 'price',
  exchange: 'US',
  category: 'general',
};

export type MyDataSourceOptions = DataSourceJsonData;

export interface SecureJsonData {
  apiToken?: string;
}
