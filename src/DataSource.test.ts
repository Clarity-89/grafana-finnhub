import { EMPTY, lastValueFrom } from 'rxjs';
import { DataSourceInstanceSettings, Field, FieldType } from '@grafana/data';
import { DataSource } from './DataSource';
import { streamTrades } from './streamTrades';
import { legacyQuery, request } from './__mocks__/data';
import { MyQuery } from './types';

const mockGet = jest.fn();
const mockReplace = jest.fn((value: string) => value);
jest.mock('@grafana/runtime', () => ({
  getBackendSrv: () => ({ get: mockGet }),
  getTemplateSrv: () => ({ replace: mockReplace, containsTemplate: (value: string) => value.includes('$') }),
}));
jest.mock('./streamTrades', () => ({ streamTrades: jest.fn(() => EMPTY) }));

// Only `url` and the DataSourceApi base fields are read; plugin meta is irrelevant here.
const settings = {
  id: 1,
  uid: 'finnhub',
  type: 'clarity89-finnhub-datasource',
  name: 'Finnhub',
  url: 'test.example.com',
  jsonData: {},
  readOnly: false,
  access: 'proxy',
} as DataSourceInstanceSettings;

describe('DataSource.query', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockReplace.mockReset().mockImplementation((value: string) => value);
  });

  it('requests one endpoint per visible target with interpolated params only', async () => {
    mockGet.mockResolvedValue({});
    const ds = new DataSource(settings);
    // Old dashboards hold the pre-1.0 shape at runtime; the prop type is the current model.
    const targets = [legacyQuery as MyQuery, { ...request.targets[0], refId: 'B', hide: true }];

    await lastValueFrom(ds.query({ ...request, targets }));

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('test.example.com/api/stock/profile2', { symbol: 'AAPL' });
  });

  it('tags the frames of each target with its refId', async () => {
    mockGet.mockResolvedValue({ name: 'Apple Inc', marketCapitalization: 2000 });
    const ds = new DataSource(settings);

    const { data } = await lastValueFrom(ds.query(request));

    expect(data[0].refId).toBe('A');
    expect(data[0].fields.map((field: Field) => [field.name, field.type, field.values])).toEqual([
      ['name', FieldType.string, ['Apple Inc']],
      ['marketCapitalization', FieldType.number, [2000]],
    ]);
  });

  it('sends free text as the raw path and shapes the response generically', async () => {
    mockGet.mockResolvedValue({ t: [1577854800], c: [1.5] });
    const ds = new DataSource(settings);
    const target = { ...request.targets[0], queryText: 'stock/candle?symbol=AAPL&resolution=D' };

    const { data } = await lastValueFrom(ds.query({ ...request, targets: [target] }));

    expect(mockGet).toHaveBeenCalledWith('test.example.com/api/stock/candle?symbol=AAPL&resolution=D', undefined);
    expect(data[0].fields[0]).toMatchObject({ name: 't', type: FieldType.time, values: [1577854800000] });
  });

  it('opens the trade stream through the proxy under the Grafana sub-path', async () => {
    const base = document.createElement('base');
    base.href = '/grafana/';
    document.head.appendChild(base);
    const ds = new DataSource({ ...settings, url: '/api/datasources/proxy/uid/finnhub' });
    const target = { ...request.targets[0], type: 'trades' as const, symbol: 'BINANCE:BTCUSDT' };

    await lastValueFrom(ds.query({ ...request, targets: [target] }));

    expect(streamTrades).toHaveBeenCalledWith(
      'ws://localhost/grafana/api/datasources/proxy/uid/finnhub/ws',
      'BINANCE:BTCUSDT',
      'A'
    );
    base.remove();
  });

  it('interpolates category, keeps a lookup term as typed and upper-cases tickers', async () => {
    // News is the only list-shaped endpoint here; the others accept an empty object.
    mockGet.mockImplementation(async (url: string) => (url.endsWith('/news') ? [] : {}));
    mockReplace.mockImplementation((value: string) => (value === '$cat' ? 'crypto' : value));
    const ds = new DataSource(settings);
    const base = request.targets[0];
    const targets: MyQuery[] = [
      { ...base, type: 'market-news', category: '$cat' },
      { ...base, refId: 'B', type: 'symbol-lookup', search: 'apple' },
      { ...base, refId: 'C', type: 'quote', symbol: 'aapl' },
    ];

    await lastValueFrom(ds.query({ ...request, targets }));

    expect(mockGet.mock.calls).toEqual([
      ['test.example.com/api/news', { category: 'crypto' }],
      ['test.example.com/api/search', { q: 'apple' }],
      ['test.example.com/api/quote', { symbol: 'AAPL' }],
    ]);
  });
});

describe('DataSource.searchSymbols', () => {
  beforeEach(() => mockGet.mockReset());

  it('returns the search result list', async () => {
    const result = [{ symbol: 'AAPL', displaySymbol: 'AAPL', description: 'Apple Inc' }];
    mockGet.mockResolvedValue({ count: 1, result });
    const ds = new DataSource(settings);

    await expect(ds.searchSymbols('apple')).resolves.toEqual(result);
    expect(mockGet).toHaveBeenCalledWith('test.example.com/api/search', { q: 'apple' });
  });

  it('skips blank text and template expressions without a request', async () => {
    const ds = new DataSource(settings);

    await expect(ds.searchSymbols('  ')).resolves.toEqual([]);
    await expect(ds.searchSymbols('$symbol')).resolves.toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('treats a body without results as empty and propagates request failures', async () => {
    const ds = new DataSource(settings);
    mockGet.mockResolvedValue({});
    await expect(ds.searchSymbols('x')).resolves.toEqual([]);

    mockGet.mockRejectedValue(new Error('429'));
    await expect(ds.searchSymbols('x')).rejects.toThrow('429');
  });
});

describe('DataSource.annotations', () => {
  const ds = new DataSource(settings);

  it('defaults to company news and refuses the trade stream', () => {
    const news: MyQuery = { ...request.targets[0], refId: 'Anno', type: 'company-news' };
    const trades: MyQuery = { ...news, type: 'trades' };
    const anno = { name: 'Company news', enable: true, iconColor: 'blue' };

    expect(ds.annotations.getDefaultQuery?.()).toEqual({ type: 'company-news' });
    expect(ds.annotations.prepareQuery?.({ ...anno, target: news })).toBe(news);
    expect(ds.annotations.prepareQuery?.({ ...anno, target: trades })).toBeUndefined();
  });
});
