import { DataFrame, SelectableValue, TimeRange } from '@grafana/data';
import {
  candleFrame,
  earningsCalendarFrame,
  earningsFrame,
  filingsFrame,
  insiderSentimentFrame,
  insiderTransactionsFrame,
  ipoCalendarFrame,
  marketHolidayFrame,
  marketStatusFrame,
  newsFrame,
  peersFrame,
  quoteFrame,
  recommendationFrame,
  sentimentFrames,
  symbolLookupFrame,
  tableFrame,
} from './frames';
import { defaultQuery, MyQuery, QueryInput, QueryType, SavedQuery } from './types';

export type QueryParams = Record<string, string | number>;

interface QueryTypeBase {
  label: string;
  /** Editor inputs this type reads. */
  inputs: readonly QueryInput[];
  /** Shown under the Data type field; carries Finnhub's limits where the type is chosen. */
  description?: string;
  /** Only works with a premium Finnhub API key. */
  premium?: boolean;
}

export interface RestQueryType extends QueryTypeBase {
  /** Finnhub REST path under /api/v1. */
  path: string;
  params(query: MyQuery, range: TimeRange): QueryParams;
  /** Each endpoint's builder declares the response shape it expects; the JSON is trusted, not validated. */
  toFrames(data: unknown, refId: string): DataFrame[];
}

interface StreamQueryType extends QueryTypeBase {
  stream: true;
}

export type QueryTypeDef = RestQueryType | StreamQueryType;

const bySymbol = ({ symbol }: MyQuery) => ({ symbol });
const isoRange = (range: TimeRange) => ({ from: range.from.format('YYYY-MM-DD'), to: range.to.format('YYYY-MM-DD') });

// Free types first, then the stream, then premium: the editor lists groups in first-appearance order.
export const queryTypes = {
  quote: { label: 'Quote', inputs: ['symbol'], path: 'quote', params: bySymbol, toFrames: quoteFrame },
  profile2: { label: 'Profile', inputs: ['symbol'], path: 'stock/profile2', params: bySymbol, toFrames: tableFrame },
  earnings: {
    label: 'Earnings',
    inputs: ['symbol'],
    description: 'Free keys return the last four quarters.',
    path: 'stock/earnings',
    params: bySymbol,
    toFrames: earningsFrame,
  },
  metric: {
    label: 'Metric',
    inputs: ['symbol', 'metric'],
    path: 'stock/metric',
    params: ({ symbol, metric }) => ({ symbol, metric }),
    toFrames: (data: { metric?: Record<string, unknown> }, refId) => tableFrame(data.metric, refId),
  },
  recommendation: {
    label: 'Recommendation trends',
    inputs: ['symbol'],
    path: 'stock/recommendation',
    params: bySymbol,
    toFrames: recommendationFrame,
  },
  'company-news': {
    label: 'Company news',
    inputs: ['symbol'],
    description: 'Free keys cover about one year of history.',
    path: 'company-news',
    params: ({ symbol }, range) => ({ symbol, ...isoRange(range) }),
    toFrames: newsFrame,
  },
  'market-news': {
    label: 'Market news',
    inputs: ['category'],
    description: 'Latest headlines; ignores the dashboard time range.',
    path: 'news',
    params: ({ category }) => ({ category }),
    toFrames: newsFrame,
  },
  filings: {
    label: 'SEC filings',
    inputs: ['symbol'],
    description: 'Finnhub returns at most 250 filings.',
    path: 'stock/filings',
    params: ({ symbol }, range) => ({ symbol, ...isoRange(range) }),
    toFrames: filingsFrame,
  },
  'insider-sentiment': {
    label: 'Insider sentiment',
    inputs: ['symbol'],
    path: 'stock/insider-sentiment',
    params: ({ symbol }, range) => ({ symbol, ...isoRange(range) }),
    toFrames: insiderSentimentFrame,
  },
  'insider-transactions': {
    label: 'Insider transactions',
    inputs: ['symbol'],
    description: 'Finnhub returns at most 100 transactions.',
    path: 'stock/insider-transactions',
    params: ({ symbol }, range) => ({ symbol, ...isoRange(range) }),
    toFrames: insiderTransactionsFrame,
  },
  'earnings-calendar': {
    label: 'Earnings calendar',
    inputs: ['symbol'],
    description: 'Clear the symbol for the whole market. Free keys cover about one month of history.',
    path: 'calendar/earnings',
    params: ({ symbol }, range) => (symbol ? { symbol, ...isoRange(range) } : isoRange(range)),
    toFrames: earningsCalendarFrame,
  },
  'ipo-calendar': {
    label: 'IPO calendar',
    inputs: [],
    path: 'calendar/ipo',
    params: (_query, range) => isoRange(range),
    toFrames: ipoCalendarFrame,
  },
  'market-holiday': {
    label: 'Market holidays',
    inputs: ['exchange'],
    path: 'stock/market-holiday',
    params: ({ exchange }) => ({ exchange }),
    toFrames: marketHolidayFrame,
  },
  'market-status': {
    label: 'Market status',
    inputs: ['exchange'],
    description: 'Current status; ignores the dashboard time range.',
    path: 'stock/market-status',
    params: ({ exchange }) => ({ exchange }),
    toFrames: marketStatusFrame,
  },
  'symbol-lookup': {
    label: 'Symbol lookup',
    inputs: ['search'],
    description: 'Search by ticker, company name, ISIN or CUSIP.',
    path: 'search',
    params: ({ symbol }) => ({ q: symbol }),
    toFrames: symbolLookupFrame,
  },
  peers: { label: 'Peers', inputs: ['symbol'], path: 'stock/peers', params: bySymbol, toFrames: peersFrame },
  trades: { label: 'Trades', inputs: ['symbol'], stream: true },
  candle: {
    label: 'Candle',
    inputs: ['symbol', 'resolution'],
    premium: true,
    path: 'stock/candle',
    params: ({ symbol, resolution }, range) => ({ symbol, resolution, from: range.from.unix(), to: range.to.unix() }),
    toFrames: candleFrame,
  },
  'social-sentiment': {
    label: 'Social sentiment',
    inputs: ['symbol'],
    premium: true,
    path: 'stock/social-sentiment',
    params: ({ symbol }, range) => ({ symbol, ...isoRange(range) }),
    toFrames: sentimentFrames,
  },
} satisfies Record<QueryType, QueryTypeDef>;

export const isQueryType = (value: unknown): value is QueryType => typeof value === 'string' && value in queryTypes;

const plain = (value: string | SelectableValue<string> | undefined) =>
  typeof value === 'object' ? value.value : value;

/** Fills defaults and converts queries persisted by versions before 0.8 to the current shape. */
export function normalizeQuery({ format, count, ...saved }: SavedQuery): MyQuery {
  const type = plain(saved.type);
  return {
    ...saved,
    type: isQueryType(type) ? type : defaultQuery.type,
    symbol: saved.symbol ?? defaultQuery.symbol,
    resolution: String(saved.resolution ?? defaultQuery.resolution),
    metric: plain(saved.metric) ?? defaultQuery.metric,
    exchange: saved.exchange ?? defaultQuery.exchange,
    category: saved.category ?? defaultQuery.category,
  };
}
