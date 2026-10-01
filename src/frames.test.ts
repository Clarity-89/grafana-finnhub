import { dateTime, FieldType } from '@grafana/data';
import { candleResponse } from './__mocks__/data';
import { candleFrame, earningsFrame, genericFrames, sentimentFrames, tableFrame } from './frames';

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
    ]);
    expect(frame.fields[0].values).toEqual([dateTime('2023-03-31').valueOf()]);
  });

  it('returns an empty frame for an empty list', () => {
    expect(earningsFrame([], 'A')[0].fields).toEqual([]);
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
