import { createDataFrame, DataFrame, FieldType, QueryResultMeta, toUtc } from '@grafana/data';

type Row = Record<string, string | number | boolean | null>;
type ColumnType = FieldType.string | FieldType.number | FieldType.boolean;

interface Column {
  key: string;
  type: ColumnType;
  name?: string;
}

interface TimeColumn {
  key: string;
  toMs: (value: string | number) => number;
  name?: string;
}

interface RowsSpec {
  time?: TimeColumn;
  columns: Column[];
  meta?: QueryResultMeta;
}

const graph: QueryResultMeta = { preferredVisualisationType: 'graph' };
const table: QueryResultMeta = { preferredVisualisationType: 'table' };

const num = (...keys: string[]): Column[] => keys.map((key) => ({ key, type: FieldType.number }));
const str = (...keys: string[]): Column[] => keys.map((key) => ({ key, type: FieldType.string }));

/** Finnhub's timezone-free dates and timestamps are read as UTC so every browser places them identically. */
export const utcMs = (value: string | number) => toUtc(value).valueOf();
export const secondsMs = (value: string | number) => Number(value) * 1000;

const noData = (refId: string) => createDataFrame({ refId, fields: [] });

const fieldTypeOf = (value: unknown): FieldType => {
  switch (typeof value) {
    case 'string':
      return FieldType.string;
    case 'boolean':
      return FieldType.boolean;
    case 'number':
      return FieldType.number;
    default:
      // Finnhub reports a missing numeric value as null
      return value === null ? FieldType.number : FieldType.other;
  }
};

/**
 * Typed frame from row objects. Column types are declared, not inferred, so an all-null column keeps
 * its type. Rows whose time value does not parse are dropped (Finnhub contract violation). Empty input
 * yields a zero-row frame that keeps every declared field.
 */
export function rowsFrame(rows: Row[] | undefined, refId: string, spec: RowsSpec): DataFrame[] {
  const time = spec.time;
  const timeOf = (row: Row) => {
    const raw = time ? row[time.key] : undefined;
    return time && (typeof raw === 'string' || typeof raw === 'number') ? time.toMs(raw) : NaN;
  };
  const kept = (rows ?? []).filter((row) => !time || Number.isFinite(timeOf(row)));
  return [
    createDataFrame({
      refId,
      meta: spec.meta,
      fields: [
        ...(time ? [{ name: time.name ?? time.key, type: FieldType.time, values: kept.map(timeOf) }] : []),
        ...spec.columns.map(({ key, type, name }) => ({
          name: name ?? key,
          type,
          values: kept.map((row) => row[key] ?? null),
        })),
      ],
    }),
  ];
}

/** Single-row table from a flat object: profile2, metric. */
export function tableFrame(data: Record<string, unknown> | undefined, refId: string): DataFrame[] {
  if (!data) {
    return [noData(refId)];
  }
  return [
    createDataFrame({
      refId,
      meta: { preferredVisualisationType: 'table' },
      fields: Object.entries(data).map(([name, value]) => ({ name, type: fieldTypeOf(value), values: [value] })),
    }),
  ];
}

interface Quote {
  /** Current price */
  c: number;
  /** Unix seconds */
  t: number;
}

export function quoteFrame(data: Quote, refId: string): DataFrame[] {
  return [
    createDataFrame({
      refId,
      meta: { preferredVisualisationType: 'table' },
      fields: [
        { name: 'time', type: FieldType.time, values: [data.t * 1000] },
        { name: 'current price', type: FieldType.number, values: [data.c] },
      ],
    }),
  ];
}

/** Quarterly EPS surprises; `symbol` is dropped. */
export function earningsFrame(data: Row[] | undefined, refId: string): DataFrame[] {
  return rowsFrame(data, refId, {
    time: { key: 'period', toMs: utcMs },
    columns: num('actual', 'estimate', 'surprise', 'surprisePercent', 'quarter', 'year'),
    meta: graph,
  });
}

interface Candles {
  s: 'ok' | 'no_data';
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
  /** Unix seconds */
  t: number[];
}

const candleSeries: Array<[key: keyof Omit<Candles, 's' | 't'>, label: string]> = [
  ['o', 'Opening price'],
  ['h', 'High price'],
  ['l', 'Low price'],
  ['c', 'Closing price'],
  ['v', 'Traded volume'],
];

export function candleFrame(data: Candles, refId: string): DataFrame[] {
  if (data.s === 'no_data') {
    return [noData(refId)];
  }
  return [
    createDataFrame({
      refId,
      meta: { preferredVisualisationType: 'graph' },
      fields: [
        {
          name: 't',
          type: FieldType.time,
          values: data.t.map((seconds) => seconds * 1000),
          config: { displayNameFromDS: 'Time' },
        },
        ...candleSeries.map(([key, label]) => ({
          name: key,
          type: FieldType.number,
          values: data[key],
          config: { displayNameFromDS: label },
        })),
      ],
    }),
  ];
}

interface SentimentPoint extends Row {
  /** ISO date-time of the sampled hour */
  atTime: string;
}

/** One frame per top-level array (one per social network), fields suffixed with its key. */
export function sentimentFrames(data: Record<string, SentimentPoint[] | string>, refId: string): DataFrame[] {
  const networks = Object.entries(data).filter(
    (entry): entry is [string, SentimentPoint[]] => Array.isArray(entry[1]) && entry[1].length > 0
  );
  // Keys stay discovered: Finnhub's sentiment metrics are all numeric and the per-network shape is open.
  return networks.map(
    ([network, points]) =>
      rowsFrame(points, refId, {
        time: { key: 'atTime', toMs: utcMs, name: `atTime-${network}` },
        columns: Object.keys(points[0])
          .filter((key) => key !== 'atTime')
          .map((key) => ({ key, type: FieldType.number, name: `${key}-${network}` })),
        meta: graph,
      })[0]
  );
}

/** Company or market news. Field names follow Grafana's annotation mapping: time, title, text, tags. */
export function newsFrame(data: Row[] | undefined, refId: string): DataFrame[] {
  return rowsFrame(data, refId, {
    time: { key: 'datetime', toMs: secondsMs, name: 'time' },
    columns: [
      { key: 'headline', type: FieldType.string, name: 'title' },
      { key: 'summary', type: FieldType.string, name: 'text' },
      { key: 'source', type: FieldType.string, name: 'tags' },
      { key: 'url', type: FieldType.string },
    ],
    meta: table,
  });
}

export function recommendationFrame(data: Row[] | undefined, refId: string): DataFrame[] {
  return rowsFrame(data, refId, {
    time: { key: 'period', toMs: utcMs },
    columns: num('strongBuy', 'buy', 'hold', 'sell', 'strongSell'),
    meta: graph,
  });
}

interface InsiderSentiment {
  data?: Array<{ year: number; month: number; change: number; mspr: number }>;
}

/** Monthly points placed on the first of the month. */
export function insiderSentimentFrame(data: InsiderSentiment, refId: string): DataFrame[] {
  const points = data.data ?? [];
  return [
    createDataFrame({
      refId,
      meta: graph,
      fields: [
        { name: 'time', type: FieldType.time, values: points.map(({ year, month }) => Date.UTC(year, month - 1, 1)) },
        { name: 'change', type: FieldType.number, values: points.map((point) => point.change) },
        { name: 'mspr', type: FieldType.number, values: points.map((point) => point.mspr) },
      ],
    }),
  ];
}

export function insiderTransactionsFrame(data: { data?: Row[] }, refId: string): DataFrame[] {
  return rowsFrame(data.data, refId, {
    time: { key: 'transactionDate', toMs: utcMs },
    columns: [...str('name', 'transactionCode'), ...num('change', 'share', 'transactionPrice'), ...str('filingDate')],
    meta: table,
  });
}

interface MarketStatus {
  exchange: string;
  holiday: string | null;
  isOpen: boolean;
  session: string | null;
  timezone: string;
  /** Unix seconds */
  t: number;
}

export function marketStatusFrame(data: MarketStatus, refId: string): DataFrame[] {
  return [
    createDataFrame({
      refId,
      meta: table,
      fields: [
        { name: 'time', type: FieldType.time, values: [data.t * 1000] },
        { name: 'isOpen', type: FieldType.boolean, values: [data.isOpen] },
        { name: 'session', type: FieldType.string, values: [data.session] },
        { name: 'holiday', type: FieldType.string, values: [data.holiday] },
        { name: 'exchange', type: FieldType.string, values: [data.exchange] },
        { name: 'timezone', type: FieldType.string, values: [data.timezone] },
      ],
    }),
  ];
}

export function marketHolidayFrame(data: { data?: Row[] }, refId: string): DataFrame[] {
  return rowsFrame(data.data, refId, {
    time: { key: 'atDate', toMs: utcMs },
    columns: str('eventName', 'tradingHour'),
    meta: table,
  });
}

export function earningsCalendarFrame(data: { earningsCalendar?: Row[] }, refId: string): DataFrame[] {
  return rowsFrame(data.earningsCalendar, refId, {
    time: { key: 'date', toMs: utcMs },
    columns: [
      ...str('symbol'),
      ...num('epsActual', 'epsEstimate', 'revenueActual', 'revenueEstimate'),
      ...str('hour'),
      ...num('quarter', 'year'),
    ],
    meta: table,
  });
}

/** `price` is a range string such as `16.00-18.00`. */
export function ipoCalendarFrame(data: { ipoCalendar?: Row[] }, refId: string): DataFrame[] {
  return rowsFrame(data.ipoCalendar, refId, {
    time: { key: 'date', toMs: utcMs },
    columns: [...str('symbol', 'name', 'exchange', 'price'), ...num('numberOfShares', 'totalSharesValue'), ...str('status')],
    meta: table,
  });
}

export function filingsFrame(data: Row[] | undefined, refId: string): DataFrame[] {
  return rowsFrame(data, refId, {
    time: { key: 'filedDate', toMs: utcMs },
    columns: str('form', 'accessNumber', 'reportUrl', 'filingUrl'),
    meta: table,
  });
}

/** `symbol` comes first so query variables pick it up as the option value. */
export function symbolLookupFrame(data: { result?: Row[] }, refId: string): DataFrame[] {
  return rowsFrame(data.result, refId, {
    columns: str('symbol', 'description', 'displaySymbol', 'type'),
    meta: table,
  });
}

export function peersFrame(data: string[] | undefined, refId: string): DataFrame[] {
  return [
    createDataFrame({
      refId,
      meta: table,
      fields: [{ name: 'symbol', type: FieldType.string, values: data ?? [] }],
    }),
  ];
}

/** Keys Finnhub uses for unix-second timestamps across endpoints. */
const unixTimeKeys = ['t', 'time', 'period'];

/** Best-effort frame for an arbitrary endpoint: one field per top-level key. */
export function genericFrames(data: unknown, refId: string): DataFrame[] {
  if (typeof data !== 'object' || data === null) {
    return [noData(refId)];
  }
  return [
    createDataFrame({
      refId,
      fields: Object.entries(data).map(([name, value]) => {
        const values = value == null ? [] : Array.isArray(value) ? value : [value];
        return unixTimeKeys.includes(name)
          ? { name, type: FieldType.time, values: values.map((seconds: number) => seconds * 1000) }
          : { name, type: fieldTypeOf(values[0]), values };
      }),
    }),
  ];
}
