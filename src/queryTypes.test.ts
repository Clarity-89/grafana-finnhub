import { dateTime } from '@grafana/data';
import { legacyQuery } from './__mocks__/data';
import { normalizeQuery, queryTypes } from './queryTypes';
import { MyQuery } from './types';

describe('normalizeQuery', () => {
  it('converts pre-0.8 Select options to plain values and drops unused fields', () => {
    expect(normalizeQuery(legacyQuery)).toEqual({
      refId: 'A',
      symbol: 'aapl',
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
      resolution: '1',
      metric: 'price',
      exchange: 'US',
      category: 'general',
    });
  });
});

const query: MyQuery = {
  refId: 'A',
  type: 'candle',
  symbol: 'AAPL',
  resolution: 'M',
  metric: 'price',
  exchange: 'US',
  category: 'general',
};

describe('queryTypes.candle.params', () => {
  it('sends the range as unix seconds', () => {
    const range = { from: dateTime(1577854800000), to: dateTime(1580533200000), raw: { from: '', to: '' } };

    expect(queryTypes.candle.params(query, range)).toEqual({
      symbol: 'AAPL',
      resolution: 'M',
      from: 1577854800,
      to: 1580533200,
    });
  });
});

describe('date-ranged params', () => {
  const range = { from: dateTime('2020-01-01'), to: dateTime('2020-02-01'), raw: { from: '', to: '' } };

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

  it('sends only the category for market news', () => {
    expect(queryTypes['market-news'].params({ ...query, category: 'crypto' })).toEqual({ category: 'crypto' });
  });
});
