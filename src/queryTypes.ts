import { DataFrame, FieldType, SelectableValue, TimeRange } from '@grafana/data';
import {
  candleFrame,
  graphMeta,
  list,
  num,
  quoteFrame,
  Row,
  rows,
  sentimentFrames,
  str,
  tableFrame,
  tableMeta,
  unixSeconds,
  utcDate,
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
const symbolRange = ({ symbol }: MyQuery, range: TimeRange) => ({ symbol, ...isoRange(range) });
const fromData = (data: { data?: Row[] }) => data.data;

/** Field names follow Grafana's annotation mapping: time, title, text, tags. */
const news = rows(
  {
    time: unixSeconds('datetime', 'time'),
    columns: [
      { key: 'headline', type: FieldType.string, name: 'title' },
      { key: 'summary', type: FieldType.string, name: 'text' },
      { key: 'source', type: FieldType.string, name: 'tags' },
      ...str('url'),
    ],
    meta: tableMeta,
  },
  list
);

export const queryTypes = {
  quote: { label: 'Quote', inputs: ['symbol'], path: 'quote', params: bySymbol, toFrames: quoteFrame },
  profile2: { label: 'Profile', inputs: ['symbol'], path: 'stock/profile2', params: bySymbol, toFrames: tableFrame },
  earnings: {
    label: 'Earnings',
    inputs: ['symbol'],
    description: 'Free keys return the last four quarters.',
    path: 'stock/earnings',
    params: bySymbol,
    toFrames: rows(
      {
        time: utcDate('period'),
        columns: num('actual', 'estimate', 'surprise', 'surprisePercent', 'quarter', 'year'),
        meta: graphMeta,
      },
      list
    ),
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
    toFrames: rows(
      { time: utcDate('period'), columns: num('strongBuy', 'buy', 'hold', 'sell', 'strongSell'), meta: graphMeta },
      list
    ),
  },
  'company-news': {
    label: 'Company news',
    inputs: ['symbol'],
    description: 'Free keys cover about one year of history.',
    path: 'company-news',
    params: symbolRange,
    toFrames: news,
  },
  'market-news': {
    label: 'Market news',
    inputs: ['category'],
    description: 'Latest headlines; ignores the dashboard time range.',
    path: 'news',
    params: ({ category }) => ({ category }),
    toFrames: news,
  },
  filings: {
    label: 'SEC filings',
    inputs: ['symbol'],
    description: 'Finnhub returns at most 250 filings.',
    path: 'stock/filings',
    params: symbolRange,
    toFrames: rows(
      { time: utcDate('filedDate'), columns: str('form', 'accessNumber', 'reportUrl', 'filingUrl'), meta: tableMeta },
      list
    ),
  },
  'insider-sentiment': {
    label: 'Insider sentiment',
    inputs: ['symbol'],
    path: 'stock/insider-sentiment',
    params: symbolRange,
    toFrames: rows(
      {
        // Monthly points placed on the first of the month.
        time: {
          name: 'time',
          ms: ({ year, month }) =>
            typeof year === 'number' && typeof month === 'number' ? Date.UTC(year, month - 1, 1) : NaN,
        },
        columns: num('change', 'mspr'),
        meta: graphMeta,
      },
      fromData
    ),
  },
  'insider-transactions': {
    label: 'Insider transactions',
    inputs: ['symbol'],
    description: 'Finnhub returns at most 100 transactions.',
    path: 'stock/insider-transactions',
    params: symbolRange,
    toFrames: rows(
      {
        time: utcDate('transactionDate'),
        columns: [
          ...str('name', 'transactionCode'),
          ...num('change', 'share', 'transactionPrice'),
          ...str('filingDate'),
        ],
        meta: tableMeta,
      },
      fromData
    ),
  },
  'earnings-calendar': {
    label: 'Earnings calendar',
    inputs: ['symbol'],
    description: 'Clear the symbol for the whole market. Free keys cover about one month of history.',
    path: 'calendar/earnings',
    params: ({ symbol }, range) => (symbol ? { symbol, ...isoRange(range) } : isoRange(range)),
    toFrames: rows(
      {
        time: utcDate('date'),
        columns: [
          ...str('symbol'),
          ...num('epsActual', 'epsEstimate', 'revenueActual', 'revenueEstimate'),
          ...str('hour'),
          ...num('quarter', 'year'),
        ],
        meta: tableMeta,
      },
      (data: { earningsCalendar?: Row[] }) => data.earningsCalendar
    ),
  },
  'ipo-calendar': {
    label: 'IPO calendar',
    inputs: [],
    path: 'calendar/ipo',
    params: (_query, range) => isoRange(range),
    // `price` is a range string such as `16.00-18.00`.
    toFrames: rows(
      {
        time: utcDate('date'),
        columns: [
          ...str('symbol', 'name', 'exchange', 'price'),
          ...num('numberOfShares', 'totalSharesValue'),
          ...str('status'),
        ],
        meta: tableMeta,
      },
      (data: { ipoCalendar?: Row[] }) => data.ipoCalendar
    ),
  },
  'market-holiday': {
    label: 'Market holidays',
    inputs: ['exchange'],
    path: 'stock/market-holiday',
    params: ({ exchange }) => ({ exchange }),
    toFrames: rows({ time: utcDate('atDate'), columns: str('eventName', 'tradingHour'), meta: tableMeta }, fromData),
  },
  'market-status': {
    label: 'Market status',
    inputs: ['exchange'],
    description: 'Current status; ignores the dashboard time range.',
    path: 'stock/market-status',
    params: ({ exchange }) => ({ exchange }),
    toFrames: rows(
      {
        time: unixSeconds('t', 'time'),
        columns: [{ key: 'isOpen', type: FieldType.boolean }, ...str('session', 'holiday', 'exchange', 'timezone')],
        meta: tableMeta,
      },
      (status: Row) => [status]
    ),
  },
  'symbol-lookup': {
    label: 'Symbol lookup',
    inputs: ['search'],
    description: 'Search by ticker, company name, ISIN or CUSIP.',
    path: 'search',
    params: ({ search }) => ({ q: search }),
    // `symbol` comes first so query variables pick it up as the option value.
    toFrames: rows(
      { columns: str('symbol', 'description', 'displaySymbol', 'type'), meta: tableMeta },
      (data: { result?: Row[] }) => data.result
    ),
  },
  peers: {
    label: 'Peers',
    inputs: ['symbol'],
    path: 'stock/peers',
    params: bySymbol,
    toFrames: rows({ columns: str('symbol'), meta: tableMeta }, (symbols: string[] | undefined) =>
      symbols?.map((symbol) => ({ symbol }))
    ),
  },
  trades: {
    label: 'Trades',
    inputs: ['symbol'],
    description: 'Live stream; not available as an annotation or variable source.',
    stream: true,
  },
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
    params: symbolRange,
    toFrames: sentimentFrames,
  },
} satisfies Record<QueryType, QueryTypeDef>;

/** Streams have no response body to shape, so annotations and variables cannot use them. */
export const isStream = (query: MyQuery): boolean => 'stream' in queryTypes[query.type];

export const isQueryType = (value: unknown): value is QueryType => typeof value === 'string' && value in queryTypes;

const plain = (value: string | SelectableValue<string> | undefined) =>
  typeof value === 'object' ? value.value : value;

/** Fills defaults and converts queries persisted by versions before 1.0 to the current shape. */
export function normalizeQuery({ format, count, ...saved }: SavedQuery): MyQuery {
  const type = plain(saved.type);
  return {
    ...saved,
    type: isQueryType(type) ? type : defaultQuery.type,
    symbol: saved.symbol ?? defaultQuery.symbol,
    search: saved.search ?? defaultQuery.search,
    resolution: String(saved.resolution ?? defaultQuery.resolution),
    metric: plain(saved.metric) ?? defaultQuery.metric,
    exchange: saved.exchange ?? defaultQuery.exchange,
    category: saved.category ?? defaultQuery.category,
  };
}
