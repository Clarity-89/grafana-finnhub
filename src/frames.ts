import { createDataFrame, DataFrame, dateTime, FieldType } from '@grafana/data';

type Row = Record<string, string | number>;

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

/** One field per key from row objects; `timeKey` holds an ISO date. */
const columns = (rows: Row[], keys: string[], timeKey: string, name: (key: string) => string = (key) => key) =>
  keys.map((key) =>
    key === timeKey
      ? { name: name(key), type: FieldType.time, values: rows.map((row) => dateTime(row[key]).valueOf()) }
      : { name: name(key), type: FieldType.number, values: rows.map((row) => row[key]) }
  );

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

interface Earning extends Row {
  /** ISO date of the reported quarter */
  period: string;
  symbol: string;
}

export function earningsFrame(data: Earning[], refId: string): DataFrame[] {
  if (!data?.length) {
    return [noData(refId)];
  }
  const keys = Object.keys(data[0]).filter((key) => key !== 'symbol');
  return [
    createDataFrame({
      refId,
      meta: { preferredVisualisationType: 'graph' },
      fields: columns(data, keys, 'period'),
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
  return networks.map(([network, points]) =>
    createDataFrame({
      refId,
      meta: { preferredVisualisationType: 'graph' },
      fields: columns(points, Object.keys(points[0]), 'atTime', (key) => `${key}-${network}`),
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
