import { FieldType, toUtc } from '@grafana/data';
import { candleResponse } from './__mocks__/data';
import {
  candleFrame,
  earningsCalendarFrame,
  earningsFrame,
  genericFrames,
  insiderSentimentFrame,
  insiderTransactionsFrame,
  marketStatusFrame,
  newsFrame,
  peersFrame,
  recommendationFrame,
  rowsFrame,
  sentimentFrames,
  symbolLookupFrame,
  tableFrame,
  utcMs,
} from './frames';

const shape = (frame: { fields: Array<{ name: string; type: FieldType; values: unknown[] }> }) =>
  frame.fields.map((field) => [field.name, field.type, field.values]);

describe('rowsFrame', () => {
  const spec = {
    time: { key: 'when', toMs: utcMs },
    columns: [
      { key: 'n', type: FieldType.number as const },
      { key: 's', type: FieldType.string as const },
    ],
  };

  it('keeps declared column types and fills missing values with null', () => {
    const [frame] = rowsFrame(
      [
        { when: '2024-01-01', n: null, s: 'x' },
        { when: '2024-01-02', n: 2, s: null },
      ],
      'A',
      spec
    );

    expect(shape(frame)).toEqual([
      ['when', FieldType.time, [toUtc('2024-01-01').valueOf(), toUtc('2024-01-02').valueOf()]],
      ['n', FieldType.number, [null, 2]],
      ['s', FieldType.string, ['x', null]],
    ]);
  });

  it('keeps an all-null column typed and drops rows whose time does not parse', () => {
    const [frame] = rowsFrame(
      [
        { when: '2024-01-01', n: null, s: 'x' },
        { when: 'garbage', n: null, s: 'y' },
      ],
      'A',
      spec
    );

    expect(shape(frame)).toEqual([
      ['when', FieldType.time, [toUtc('2024-01-01').valueOf()]],
      ['n', FieldType.number, [null]],
      ['s', FieldType.string, ['x']],
    ]);
  });

  it('keeps every declared field at zero rows', () => {
    expect(shape(rowsFrame([], 'A', spec)[0])).toEqual([
      ['when', FieldType.time, []],
      ['n', FieldType.number, []],
      ['s', FieldType.string, []],
    ]);
  });
});

describe('utcMs', () => {
  it('reads a date-only value as UTC midnight', () => {
    expect(utcMs('2026-10-01')).toBe(1790812800000);
  });
});

describe('candleFrame', () => {
  it('converts unix seconds to milliseconds and labels every series', () => {
    const [frame] = candleFrame(candleResponse, 'A');

    expect(frame.fields.map((field) => [field.name, field.config.displayNameFromDS, field.values])).toEqual([
      ['t', 'Time', [1577854800000, 1580533200000]],
      ['o', 'Opening price', candleResponse.o],
      ['h', 'High price', candleResponse.h],
      ['l', 'Low price', candleResponse.l],
      ['c', 'Closing price', candleResponse.c],
      ['v', 'Traded volume', candleResponse.v],
    ]);
  });

  it('returns an empty frame for no_data', () => {
    expect(candleFrame({ ...candleResponse, s: 'no_data' }, 'A')[0].fields).toEqual([]);
  });
});

describe('tableFrame', () => {
  it('types each column from its value, treating null as a missing number', () => {
    const [frame] = tableFrame({ name: 'Apple', pe: 28.1, beta: null }, 'A');

    expect(frame.meta?.preferredVisualisationType).toBe('table');
    expect(frame.fields.map((field) => [field.name, field.type])).toEqual([
      ['name', FieldType.string],
      ['pe', FieldType.number],
      ['beta', FieldType.number],
    ]);
  });

  it('returns an empty frame without data', () => {
    expect(tableFrame(undefined, 'A')[0].fields).toEqual([]);
  });
});

describe('earningsFrame', () => {
  it('uses the period as time and drops the symbol column', () => {
    const [frame] = earningsFrame([{ period: '2023-03-31', symbol: 'AAPL', actual: 1.5, estimate: 1.4 }], 'A');

    expect(frame.fields.map((field) => [field.name, field.type])).toEqual([
      ['period', FieldType.time],
      ['actual', FieldType.number],
      ['estimate', FieldType.number],
      ['surprise', FieldType.number],
      ['surprisePercent', FieldType.number],
      ['quarter', FieldType.number],
      ['year', FieldType.number],
    ]);
    expect(frame.fields[0].values).toEqual([toUtc('2023-03-31').valueOf()]);
  });

  it('returns typed empty fields for an empty list', () => {
    expect(earningsFrame([], 'A')[0].fields.map((field) => field.values)).toEqual([[], [], [], [], [], [], []]);
  });
});

describe('newsFrame', () => {
  it('names fields for Grafana annotation mapping and drops the rest', () => {
    const [frame] = newsFrame(
      [
        {
          datetime: 1569550360,
          headline: 'H',
          summary: 'S',
          source: 'CNBC',
          url: 'u',
          id: 1,
          category: 'c',
          image: 'i',
          related: 'AAPL',
        },
      ],
      'A'
    );

    expect(shape(frame)).toEqual([
      ['time', FieldType.time, [1569550360000]],
      ['title', FieldType.string, ['H']],
      ['text', FieldType.string, ['S']],
      ['tags', FieldType.string, ['CNBC']],
      ['url', FieldType.string, ['u']],
    ]);
  });

  it('keeps the field layout without items', () => {
    expect(newsFrame([], 'A')[0].fields.map((field) => field.name)).toEqual(['time', 'title', 'text', 'tags', 'url']);
  });
});

describe('recommendationFrame', () => {
  it('places the monthly period as time ahead of the five rating counts', () => {
    const [frame] = recommendationFrame(
      [{ buy: 24, hold: 7, period: '2025-03-01', sell: 0, strongBuy: 13, strongSell: 0, symbol: 'AAPL' }],
      'A'
    );

    expect(frame.fields.map((field) => field.name)).toEqual(['period', 'strongBuy', 'buy', 'hold', 'sell', 'strongSell']);
    expect(frame.fields[0].values[0]).toBe(toUtc('2025-03-01').valueOf());
  });
});

describe('insiderSentimentFrame', () => {
  it('places each month on its first day in UTC', () => {
    const [frame] = insiderSentimentFrame({ data: [{ year: 2022, month: 1, change: -1250, mspr: -5.6 }] }, 'A');

    expect(shape(frame)).toEqual([
      ['time', FieldType.time, [Date.UTC(2022, 0, 1)]],
      ['change', FieldType.number, [-1250]],
      ['mspr', FieldType.number, [-5.6]],
    ]);
  });
});

describe('insiderTransactionsFrame', () => {
  it('uses the transaction date as time', () => {
    const [frame] = insiderTransactionsFrame(
      {
        data: [
          {
            name: 'K',
            share: 1,
            change: -1,
            filingDate: '2021-03-19',
            transactionDate: '2021-03-17',
            transactionCode: 'S',
            transactionPrice: 655.81,
          },
        ],
      },
      'A'
    );

    expect(frame.fields[0]).toMatchObject({
      name: 'transactionDate',
      type: FieldType.time,
      values: [toUtc('2021-03-17').valueOf()],
    });
    expect(frame.fields.map((field) => [field.name, field.type])).toContainEqual(['name', FieldType.string]);
    expect(frame.fields.map((field) => [field.name, field.type])).toContainEqual(['change', FieldType.number]);
  });
});

describe('marketStatusFrame', () => {
  it('keeps the boolean and nullable string fields typed', () => {
    const [frame] = marketStatusFrame(
      { exchange: 'US', holiday: null, isOpen: false, session: null, timezone: 'America/New_York', t: 1697018041 },
      'A'
    );

    expect(shape(frame)).toEqual([
      ['time', FieldType.time, [1697018041000]],
      ['isOpen', FieldType.boolean, [false]],
      ['session', FieldType.string, [null]],
      ['holiday', FieldType.string, [null]],
      ['exchange', FieldType.string, ['US']],
      ['timezone', FieldType.string, ['America/New_York']],
    ]);
  });
});

describe('earningsCalendarFrame', () => {
  it('keeps an unreported actual typed as number', () => {
    const [frame] = earningsCalendarFrame(
      {
        earningsCalendar: [
          {
            date: '2026-10-29',
            epsActual: null,
            epsEstimate: 1.2,
            hour: 'amc',
            quarter: 4,
            revenueActual: null,
            revenueEstimate: 1e9,
            symbol: 'AAPL',
            year: 2026,
          },
        ],
      },
      'A'
    );

    expect(frame.fields.find((field) => field.name === 'epsActual')).toMatchObject({
      type: FieldType.number,
      values: [null],
    });
  });
});

describe('symbolLookupFrame', () => {
  it('puts the symbol first for query variables', () => {
    const [frame] = symbolLookupFrame(
      { result: [{ description: 'APPLE INC', displaySymbol: 'AAPL', symbol: 'AAPL', type: 'Common Stock' }] },
      'A'
    );

    expect(frame.fields[0]).toMatchObject({ name: 'symbol', type: FieldType.string, values: ['AAPL'] });
  });

  it('keeps the typed symbol field without matches', () => {
    expect(symbolLookupFrame({ result: [] }, 'A')[0].fields[0]).toMatchObject({ name: 'symbol', values: [] });
  });
});

describe('peersFrame', () => {
  it('returns a single symbol field', () => {
    expect(shape(peersFrame(['AAPL', 'MSFT'], 'A')[0])).toEqual([['symbol', FieldType.string, ['AAPL', 'MSFT']]]);
  });

  it('keeps the typed field without peers', () => {
    expect(peersFrame([], 'A')[0].fields[0]).toMatchObject({ name: 'symbol', values: [] });
  });
});

describe('sentimentFrames', () => {
  it('builds one frame per non-empty array key, suffixing fields with the key', () => {
    const frames = sentimentFrames(
      { symbol: 'AAPL', data: [{ atTime: '2021-05-08 14:00:00', score: -0.03 }], reddit: [] },
      'A'
    );

    expect(frames).toHaveLength(1);
    expect(frames[0].fields.map((field) => [field.name, field.type])).toEqual([
      ['atTime-data', FieldType.time],
      ['score-data', FieldType.number],
    ]);
  });
});

describe('genericFrames', () => {
  it('spreads arrays into columns, scales unix time keys, and types from the first value', () => {
    const [frame] = genericFrames({ t: [1577854800], c: [1.5], s: 'ok', nested: { a: 1 } }, 'A');

    expect(frame.fields.map((field) => [field.name, field.type, field.values])).toEqual([
      ['t', FieldType.time, [1577854800000]],
      ['c', FieldType.number, [1.5]],
      ['s', FieldType.string, ['ok']],
      ['nested', FieldType.other, [{ a: 1 }]],
    ]);
  });

  it('returns an empty frame for a non-object body', () => {
    expect(genericFrames('', 'A')[0].fields).toEqual([]);
  });
});
