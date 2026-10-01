import { dateTime } from '@grafana/data';
import { legacyQuery } from './__mocks__/data';
import { normalizeQuery, queryTypes } from './queryTypes';

describe('normalizeQuery', () => {
  it('converts pre-0.8 Select options to plain values and drops unused fields', () => {
    expect(normalizeQuery(legacyQuery)).toEqual({
      refId: 'A',
      symbol: 'aapl',
      type: 'profile2',
      metric: 'price',
      resolution: '1',
    });
  });

  it('falls back to defaults for missing or unknown values', () => {
    expect(normalizeQuery({ refId: 'A', type: { value: 'exchange' } })).toEqual({
      refId: 'A',
      type: 'profile2',
      symbol: '',
      resolution: '1',
      metric: 'price',
    });
  });
});

describe('queryTypes.candle.params', () => {
  it('sends the range as unix seconds', () => {
    const range = { from: dateTime(1577854800000), to: dateTime(1580533200000), raw: { from: '', to: '' } };
    const query = { refId: 'A', type: 'candle' as const, symbol: 'AAPL', resolution: 'M', metric: 'price' };

    expect(queryTypes.candle.params(query, range)).toEqual({
      symbol: 'AAPL',
      resolution: 'M',
      from: 1577854800,
      to: 1580533200,
    });
  });
});
