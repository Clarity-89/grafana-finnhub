import { FieldType, toUtc } from '@grafana/data';
import { candleResponse } from './__mocks__/data';
import {
  candleFrame,
  genericFrames,
  list,
  rows,
  rowsFrame,
  RowsSpec,
  sentimentFrames,
  str,
  tableFrame,
  unixSeconds,
  utcDate,
  utcMs,
} from './frames';

const shape = (frame: { fields: Array<{ name: string; type: FieldType; values: unknown[] }> }) =>
  frame.fields.map((field) => [field.name, field.type, field.values]);

describe('rowsFrame', () => {
  const spec: RowsSpec = {
    time: utcDate('when'),
    columns: [
      { key: 'n', type: FieldType.number },
      { key: 's', type: FieldType.string },
    ],
  };

  it('keeps declared column types and fills missing values with null', () => {
    const frame = rowsFrame(
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

  it('keeps an all-null column typed and drops rows without a usable time', () => {
    const frame = rowsFrame(
      [
        { when: '2024-01-01', n: null, s: 'x' },
        { when: 'garbage', n: null, s: 'y' },
        { n: null, s: 'z' },
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
    expect(shape(rowsFrame([], 'A', spec))).toEqual([
      ['when', FieldType.time, []],
      ['n', FieldType.number, []],
      ['s', FieldType.string, []],
    ]);
  });

  it('renames fields and reads unix seconds', () => {
    const frame = rowsFrame([{ at: 1569550360, v: 'x' }], 'A', {
      time: unixSeconds('at', 'time'),
      columns: [{ key: 'v', type: FieldType.string, name: 'value' }],
    });

    expect(shape(frame)).toEqual([
      ['time', FieldType.time, [1569550360000]],
      ['value', FieldType.string, ['x']],
    ]);
  });
});

describe('utcMs', () => {
  it('reads a date-only value as UTC midnight', () => {
    expect(utcMs('2026-10-01')).toBe(1790812800000);
  });

  it('is NaN for a missing value instead of the current time', () => {
    expect(utcMs(undefined)).toBeNaN();
    expect(utcMs(null)).toBeNaN();
  });
});

describe('rows', () => {
  const spec: RowsSpec = { columns: str('symbol') };

  it('shapes a list body or the list picked from an envelope, treating a missing list as empty', () => {
    expect(rows(spec, list)([{ symbol: 'AAPL' }], 'A')[0].fields[0].values).toEqual(['AAPL']);
    expect(
      rows(spec, (data: { result?: Array<{ symbol: string }> }) => data.result)({}, 'A')[0].fields[0]
    ).toMatchObject({ name: 'symbol', values: [] });
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

describe('sentimentFrames', () => {
  it('builds one frame per non-empty array key, suffixing fields with the key', () => {
    const frames = sentimentFrames(
      { symbol: 'AAPL', data: [{ atTime: '2021-05-08 14:00:00', score: -0.03 }], reddit: [] },
      'A'
    );

    expect(frames).toHaveLength(1);
    expect(shape(frames[0])).toEqual([
      ['atTime-data', FieldType.time, [toUtc('2021-05-08 14:00:00').valueOf()]],
      ['score-data', FieldType.number, [-0.03]],
    ]);
  });
});

describe('genericFrames', () => {
  it('spreads arrays into columns, scales unix time keys, and types from the first value', () => {
    const [frame] = genericFrames({ t: [1577854800], c: [1.5], s: 'ok', nested: { a: 1 } }, 'A');

    expect(shape(frame)).toEqual([
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
