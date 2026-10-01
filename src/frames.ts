import { createDataFrame, DataFrame, FieldType, QueryResultMeta, toUtc } from '@grafana/data';

export type Row = Record<string, string | number | boolean | null>;
type ColumnType = FieldType.string | FieldType.number | FieldType.boolean;

interface Column {
  key: string;
  type: ColumnType;
  name?: string;
}

interface TimeColumn {
  name: string;
  /** Milliseconds for a row; NaN when the row carries no usable time. */
  ms: (row: Row) => number;
}

export interface RowsSpec {
  time?: TimeColumn;
  columns: Column[];
  meta?: QueryResultMeta;
}

export const graphMeta: QueryResultMeta = { preferredVisualisationType: 'graph' };
export const tableMeta: QueryResultMeta = { preferredVisualisationType: 'table' };

export const num = (...keys: string[]): Column[] => keys.map((key) => ({ key, type: FieldType.number }));
export const str = (...keys: string[]): Column[] => keys.map((key) => ({ key, type: FieldType.string }));

/**
 * Finnhub's timezone-free dates and timestamps are read as UTC so every browser places them identically.
 * Anything else is NaN: `toUtc(undefined)` would silently mean "now".
 */
export const utcMs = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? toUtc(value).valueOf() : NaN;

/** Time column read from a `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss` value. */
export const utcDate = (key: string, name = key): TimeColumn => ({ name, ms: (row) => utcMs(row[key]) });

/** Time column read from unix seconds. */
export const unixSeconds = (key: string, name = key): TimeColumn => ({
  name,
  ms: (row) => {
    const seconds = row[key];
    return typeof seconds === 'number' ? seconds * 1000 : NaN;
  },
});

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
 * Typed frame from row objects. Column types are declared, not inferred, so an all-null column keeps its type and
 * empty input keeps every field. A row without a usable time cannot be placed on a graph, so it is dropped.
 */
export function rowsFrame(rows: Row[], refId: string, { time, columns, meta }: RowsSpec): DataFrame {
  const kept = time ? rows.filter((row) => Number.isFinite(time.ms(row))) : rows;
  return createDataFrame({
    refId,
    meta,
    fields: [
      ...(time ? [{ name: time.name, type: FieldType.time, values: kept.map(time.ms) }] : []),
      ...columns.map(({ key, type, name }) => ({
        name: name ?? key,
        type,
        values: kept.map((row) => row[key] ?? null),
      })),
    ],
  });
}

/** Registry adapter: one typed frame from the rows `pick` extracts from the response. */
export const rows =
  <T>(spec: RowsSpec, pick: (data: T) => Row[] | undefined) =>
  (data: T, refId: string): DataFrame[] =>
    [rowsFrame(pick(data) ?? [], refId, spec)];

/** Picker for responses that are the row list itself. */
export const list = (data: Row[] | undefined) => data;

/** Single-row table from a flat object: profile2, metric. */
export function tableFrame(data: Record<string, unknown> | undefined, refId: string): DataFrame[] {
  if (!data) {
    return [noData(refId)];
  }
  return [
    createDataFrame({
      refId,
      meta: tableMeta,
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
      meta: tableMeta,
      fields: [
        { name: 'time', type: FieldType.time, values: [data.t * 1000] },
        { name: 'current price', type: FieldType.number, values: [data.c] },
      ],
    }),
  ];
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
      meta: graphMeta,
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
  return networks.map(([network, points]) =>
    rowsFrame(points, refId, {
      time: utcDate('atTime', `atTime-${network}`),
      columns: Object.keys(points[0])
        .filter((key) => key !== 'atTime')
        .map((key) => ({ key, type: FieldType.number, name: `${key}-${network}` })),
      meta: graphMeta,
    })
  );
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
