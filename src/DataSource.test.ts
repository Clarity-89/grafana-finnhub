import { DataSource } from './DataSource';
import { dateTime, MutableField, PluginType } from '@grafana/data';
import { candleResponse, data } from './__mocks__/data';
import { TargetType } from './types';

var mockGet: jest.Mock;
jest.mock('@grafana/runtime', () => {
  mockGet = jest.fn();
  return {
    getBackendSrv: () => ({
      get: mockGet,
    }),
  };
});

const getDs = (opts: any = {}) => {
  const defaults = {
    type: 'finnhub-datasource',
    id: 1,
    url: 'test.example.com',
    meta: {
      name: 'Finnhub',
      type: PluginType.datasource,
      id: 'finnhub-datasource',
      module: 'plugins/finnhub-datasource/module',
      baseUrl: 'public/plugins/finnhub-datasource',
      url: 'test.example.com',
      info: {
        author: { name: 'Alex Khomenko', url: '' },
        description: 'Finnhub Data Source',
        links: [],
        logos: {
          small: 'public/plugins/finnhub-datasource/img/logo.svg',
          large: 'public/plugins/finnhub-datasource/img/logo.svg',
        },

        build: {},
        screenshots: [],
        version: '1.0.0',
        updated: '2020-03-10',
      },
    },
    name: 'Finnhub',
    jsonData: { apiToken: '123XX' },
  };
  return new DataSource({ ...defaults, ...opts });
};

describe('DataSource', () => {
  it('should construct query based on params', () => {
    const ds = getDs();
    const target = { symbol: 'test' };
    const range = { to: dateTime(), from: dateTime().subtract(1, 'months'), raw: { from: 'now-1m', to: 'now' } };
    expect(ds.constructQuery(target, range)).toEqual({ symbol: 'TEST' });
    expect(ds.constructQuery({ ...target, type: { value: 'candle' }, resolution: 'M' }, range)).toEqual({
      symbol: 'TEST',
      resolution: 'M',
      to: range.to.unix(),
      from: range.from.unix(),
    });
  });

  it('should call backendSrv.get with correct params', () => {
    mockGet.mockReturnValue(candleResponse);
    const ds = getDs({});
    ds.query(data);
    expect(mockGet).toBeCalledWith(`${ds.url}/api/stock/profile2`, {
      symbol: 'AAPL',
      refId: 'A',
    });
  });

  it('should return correct timeseries response for candle request', () => {
    mockGet.mockReturnValue(candleResponse);
    const ds = getDs({});

    const data = ds.tsResponse(candleResponse, {
      type: { value: 'candle' },
      refId: 'A',
      format: TargetType.Timeseries,
      metric: { value: '' },
    });

    const candleData = {
      c: [309.51, 256.59],
      h: [327.85, 327.22],
      l: [292.75, 254.99],
      o: [296.24, 304.3],
      t: [1577854800000, 1580533200000],
      v: [908559107, 811232864],
    };
    Object.entries(candleData).forEach(([key, val]) =>
      expect(data[0].fields.find((f: MutableField) => f.name === key)?.values.toArray()).toEqual(val)
    );
  });

  describe('tableResponse', () => {
    const data = [
      {
        address: '1 Apple Park Way',
        city: 'CUPERTINO',
        country: 'US',
        description: 'Apple Inc. designs',
        name: 'Apple Inc',
      },
    ];
    mockGet.mockReturnValue(candleResponse);
    const ds = getDs({});

    it('should return correct data for table response', () => {
      expect(
        ds
          .tableResponse(data, {
            type: { value: 'profile' },
            refId: 'A',
            format: TargetType.Table,
            metric: { value: '' },
          })[0]
          .fields[0].values.toArray()
      ).toEqual(data);
    });

    it('should return empty data frame for no data', () => {
      const field = ds.tableResponse(undefined, {
        type: { value: 'profile' },
        refId: 'A',
        format: TargetType.Table,
        metric: { value: '' },
      })[0].fields[0];

      expect(field.values.toArray()).toEqual([]);
      expect(field.name).toEqual('no data');
    });
  });
});
