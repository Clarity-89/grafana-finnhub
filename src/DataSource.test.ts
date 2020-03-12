import moment from 'moment';
import { DataSource } from './DataSource';
import { PluginType } from '@grafana/data';
import { data, candleResponse } from './__mocks__/data';

const getDs = (opts: any = {}, backendSrv = { get: () => '' }) => {
  const defaults = {
    type: 'finnhub-datasource',
    id: 1,
    meta: {
      name: 'Finnhub',
      type: PluginType.datasource,
      id: 'finnhub-datasource',
      module: 'plugins/finnhub-datasource/module',
      baseUrl: 'public/plugins/finnhub-datasource',
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
  //@ts-ignore
  return new DataSource({ ...defaults, ...opts }, backendSrv);
};

describe('DataSource', () => {
  it('should construct query based on params', () => {
    const ds = getDs();
    const target = { symbol: 'test' };
    const range = { to: moment(), from: moment().subtract(1, 'months') };
    expect(ds.constructQuery(target, range)).toEqual({ symbol: 'TEST' });
    expect(ds.constructQuery({ ...target, queryType: { value: 'candle' }, resolution: 'M' }, range)).toEqual({
      symbol: 'TEST',
      resolution: 'M',
      to: range.to.unix(),
      from: range.from.unix(),
    });
  });

  it('should call backendSrv.get with correct params', () => {
    const mockGet = jest.fn();
    mockGet.mockReturnValue(candleResponse);
    // @ts-ignore
    const ds = getDs({}, { get: mockGet });
    ds.query(data);
    expect(mockGet).toBeCalledWith(`${ds.baseUrl}/stock/candle`, {
      token: ds.token,
      from: 1344947769,
      to: 1660480569,
      resolution: 'M',
      symbol: 'AAPL',
    });
  });

  it('should return correct timeseries response for candle request', () => {
    //@ts-ignore
    const ds = getDs({}, { get: () => candleResponse });

    const data = ds.tsResponse(candleResponse, 'candle');
    expect(data).toEqual([
      {
        datapoints: [
          [296.24, 1577854800000],
          [304.3, 1580533200000],
        ],
        target: 'open price',
      },
      {
        datapoints: [
          [309.51, 1577854800000],
          [256.59, 1580533200000],
        ],
        target: 'close price',
      },
    ]);
  });
});
