import { EMPTY, lastValueFrom } from 'rxjs';
import { DataSourceInstanceSettings, Field, FieldType } from '@grafana/data';
import { DataSource } from './DataSource';
import { streamTrades } from './streamTrades';
import { legacyQuery, request } from './__mocks__/data';
import { MyQuery } from './types';

const mockGet = jest.fn();
jest.mock('@grafana/runtime', () => ({
  getBackendSrv: () => ({ get: mockGet }),
  getTemplateSrv: () => ({ replace: (value: string) => value }),
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
  beforeEach(() => mockGet.mockReset());

  it('requests one endpoint per visible target with interpolated params only', async () => {
    mockGet.mockResolvedValue({});
    const ds = new DataSource(settings);
    // Old dashboards hold the pre-0.8 shape at runtime; the prop type is the current model.
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
});
