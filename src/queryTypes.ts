import { DataFrame, SelectableValue, TimeRange } from '@grafana/data';
import { candleFrame, earningsFrame, quoteFrame, sentimentFrames, tableFrame } from './frames';
import { defaultQuery, MyQuery, QueryType, SavedQuery } from './types';

export type QueryParams = Record<string, string | number>;

interface QueryTypeBase {
  label: string;
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

export const queryTypes = {
  quote: { label: 'Quote', path: 'quote', params: bySymbol, toFrames: quoteFrame },
  earnings: { label: 'Earnings', path: 'stock/earnings', params: bySymbol, toFrames: earningsFrame },
  candle: {
    label: 'Candle',
    premium: true,
    path: 'stock/candle',
    params: ({ symbol, resolution }, range) => ({ symbol, resolution, from: range.from.unix(), to: range.to.unix() }),
    toFrames: candleFrame,
  },
  trades: { label: 'Trades', stream: true },
  'social-sentiment': {
    label: 'Social sentiment',
    premium: true,
    path: 'stock/social-sentiment',
    params: ({ symbol }, range) => ({
      symbol,
      from: range.from.format('YYYY-MM-DD'),
      to: range.to.format('YYYY-MM-DD'),
    }),
    toFrames: sentimentFrames,
  },
  profile2: { label: 'Profile', path: 'stock/profile2', params: bySymbol, toFrames: tableFrame },
  metric: {
    label: 'Metric',
    path: 'stock/metric',
    params: ({ symbol, metric }) => ({ symbol, metric }),
    toFrames: (data: { metric?: Record<string, unknown> }, refId) => tableFrame(data.metric, refId),
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
  };
}
