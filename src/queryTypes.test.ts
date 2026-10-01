import { dateTime, FieldType, toUtc } from '@grafana/data';
import { legacyQuery } from './__mocks__/data';
import { isStream, normalizeQuery, queryTypes } from './queryTypes';
import { MyQuery } from './types';

const shape = (frame: { fields: Array<{ name: string; type: FieldType; values: unknown[] }> }) =>
  frame.fields.map((field) => [field.name, field.type, field.values]);

const query: MyQuery = {
  refId: 'A',
  type: 'candle',
  symbol: 'AAPL',
  search: '',
  resolution: 'M',
  metric: 'price',
  exchange: 'US',
  category: 'general',
};

describe('normalizeQuery', () => {
  it('converts pre-0.8 Select options to plain values and drops unused fields', () => {
    expect(normalizeQuery(legacyQuery)).toEqual({
      refId: 'A',
      symbol: 'aapl',
      search: '',
      type: 'profile2',
      metric: 'price',
      resolution: '1',
      exchange: 'US',
      category: 'general',
    });
  });

  it('falls back to defaults for missing or unknown values', () => {
    expect(normalizeQuery({ refId: 'A', type: { value: 'exchange' } })).toEqual({
      refId: 'A',
      type: 'profile2',
      symbol: '',
      search: '',
      resolution: '1',
      metric: 'price',
      exchange: 'US',
      category: 'general',
    });
  });
});

describe('isStream', () => {
  it('is true only for the websocket type', () => {
    expect(isStream({ ...query, type: 'trades' })).toBe(true);
    expect(isStream({ ...query, type: 'company-news' })).toBe(false);
  });
});

describe('params', () => {
  const range = { from: dateTime('2020-01-01'), to: dateTime('2020-02-01'), raw: { from: '', to: '' } };

  it('sends the candle range as unix seconds', () => {
    const unix = { from: dateTime(1577854800000), to: dateTime(1580533200000), raw: { from: '', to: '' } };

    expect(queryTypes.candle.params(query, unix)).toEqual({
      symbol: 'AAPL',
      resolution: 'M',
      from: 1577854800,
      to: 1580533200,
    });
  });

  it('sends the range as ISO dates with the symbol', () => {
    expect(queryTypes['company-news'].params(query, range)).toEqual({
      symbol: 'AAPL',
      from: '2020-01-01',
      to: '2020-02-01',
    });
  });

  it('omits an empty symbol from the earnings calendar to cover the whole market', () => {
    expect(queryTypes['earnings-calendar'].params({ ...query, symbol: '' }, range)).toEqual({
      from: '2020-01-01',
      to: '2020-02-01',
    });
    expect(queryTypes['earnings-calendar'].params(query, range)).toEqual({
      symbol: 'AAPL',
      from: '2020-01-01',
      to: '2020-02-01',
    });
  });

  it('sends only the category for market news and the search term for symbol lookup', () => {
    expect(queryTypes['market-news'].params({ ...query, category: 'crypto' })).toEqual({ category: 'crypto' });
    expect(queryTypes['symbol-lookup'].params({ ...query, search: 'apple' })).toEqual({ q: 'apple' });
  });
});

describe('toFrames', () => {
  it('earnings: uses the period as time and drops the symbol column', () => {
    const [frame] = queryTypes.earnings.toFrames(
      [{ period: '2023-03-31', symbol: 'AAPL', actual: 1.5, estimate: 1.4 }],
      'A'
    );

    expect(frame.fields.map((field) => field.name)).toEqual([
      'period',
      'actual',
      'estimate',
      'surprise',
      'surprisePercent',
      'quarter',
      'year',
    ]);
    expect(frame.fields[0]).toMatchObject({ type: FieldType.time, values: [toUtc('2023-03-31').valueOf()] });
    expect(queryTypes.earnings.toFrames([], 'A')[0].fields.map((field) => field.values)).toEqual([
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ]);
  });

  it('news: names fields for Grafana annotation mapping and drops the rest', () => {
    const [frame] = queryTypes['company-news'].toFrames(
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
    expect(queryTypes['market-news'].toFrames([], 'A')[0].fields.map((field) => field.name)).toEqual([
      'time',
      'title',
      'text',
      'tags',
      'url',
    ]);
  });

  it('recommendation: places the monthly period as time ahead of the five rating counts', () => {
    const [frame] = queryTypes.recommendation.toFrames(
      [{ buy: 24, hold: 7, period: '2025-03-01', sell: 0, strongBuy: 13, strongSell: 0, symbol: 'AAPL' }],
      'A'
    );

    expect(frame.fields.map((field) => field.name)).toEqual([
      'period',
      'strongBuy',
      'buy',
      'hold',
      'sell',
      'strongSell',
    ]);
    expect(frame.fields[0].values[0]).toBe(toUtc('2025-03-01').valueOf());
  });

  it('insider sentiment: places each month on its first day in UTC', () => {
    const [frame] = queryTypes['insider-sentiment'].toFrames(
      { data: [{ symbol: 'TSLA', year: 2022, month: 1, change: -1250, mspr: -5.6 }] },
      'A'
    );

    expect(shape(frame)).toEqual([
      ['time', FieldType.time, [Date.UTC(2022, 0, 1)]],
      ['change', FieldType.number, [-1250]],
      ['mspr', FieldType.number, [-5.6]],
    ]);
  });

  it('insider transactions: uses the transaction date as time', () => {
    const [frame] = queryTypes['insider-transactions'].toFrames(
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

  it('market status: keeps the boolean and nullable string fields typed', () => {
    const [frame] = queryTypes['market-status'].toFrames(
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

  it('earnings calendar: keeps an unreported actual typed as number', () => {
    const [frame] = queryTypes['earnings-calendar'].toFrames(
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

  it('symbol lookup: puts the symbol first for query variables, also without matches', () => {
    const [frame] = queryTypes['symbol-lookup'].toFrames(
      { result: [{ description: 'APPLE INC', displaySymbol: 'AAPL', symbol: 'AAPL', type: 'Common Stock' }] },
      'A'
    );

    expect(frame.fields[0]).toMatchObject({ name: 'symbol', type: FieldType.string, values: ['AAPL'] });
    expect(queryTypes['symbol-lookup'].toFrames({ result: [] }, 'A')[0].fields[0]).toMatchObject({
      name: 'symbol',
      values: [],
    });
  });

  it('peers: turns the symbol list into a single typed field, also when empty', () => {
    expect(shape(queryTypes.peers.toFrames(['AAPL', 'MSFT'], 'A')[0])).toEqual([
      ['symbol', FieldType.string, ['AAPL', 'MSFT']],
    ]);
    expect(queryTypes.peers.toFrames([], 'A')[0].fields[0]).toMatchObject({ name: 'symbol', values: [] });
  });
});
