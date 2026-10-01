import { DataQueryRequest, dateTime } from '@grafana/data';
import { MyQuery, SavedQuery } from '../types';

export const request: DataQueryRequest<MyQuery> = {
  app: 'dashboard',
  requestId: 'Q101',
  timezone: '',
  range: {
    from: dateTime('2012-08-14T12:36:09.485Z'),
    to: dateTime('2022-08-14T12:36:09.485Z'),
    raw: { from: '2012-08-14T12:36:09.485Z', to: '2022-08-14T12:36:09.485Z' },
  },
  interval: '1d',
  intervalMs: 86400000,
  targets: [
    { refId: 'A', type: 'profile2', symbol: 'AAPL', resolution: '1', metric: 'price', exchange: 'US', category: 'general' },
  ],
  scopedVars: {},
  startTime: 1584015969943,
};

/** Shape written by plugin versions before 0.8. */
export const legacyQuery: SavedQuery = {
  refId: 'A',
  symbol: 'aapl',
  resolution: 1,
  format: 'TIMESERIES',
  count: 1000,
  type: { value: 'profile2', label: 'Profile' },
  metric: { value: 'price', label: 'price' },
};

export const candleResponse = {
  c: [309.51, 256.59],
  h: [327.85, 327.22],
  l: [292.75, 254.99],
  o: [296.24, 304.3],
  s: 'ok' as const,
  t: [1577854800, 1580533200],
  v: [908559107, 811232864],
};
