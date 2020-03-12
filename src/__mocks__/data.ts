import moment from 'moment';
export const data = {
  app: 'dashboard',
  requestId: 'Q101',
  timezone: '',
  panelId: 6,
  dashboardId: 46,
  range: {
    from: moment('2012-08-14T12:36:09.485Z'),
    to: moment('2022-08-14T12:36:09.485Z'),
    raw: {
      from: '2012-08-14T12:36:09.485Z',
      to: '2022-08-14T12:36:09.485Z',
    },
  },
  timeInfo: '',
  interval: '1d',
  intervalMs: 86400000,
  targets: [
    {
      queryType: {
        label: 'Candle',
        value: 'candle',
      },
      refId: 'A',
      resolution: 'M',
      symbol: 'aapl',
      datasource: 'Finnhub',
    },
  ],
  maxDataPoints: 750,
  scopedVars: {
    __interval: {
      text: '1d',
      value: '1d',
    },
    __interval_ms: {
      text: '86400000',
      value: 86400000,
    },
  },
  startTime: 1584015969943,
  rangeRaw: {
    from: '2012-08-14T12:36:09.485Z',
    to: '2022-08-14T12:36:09.485Z',
  },
};

export const candleResponse = {
  c: [309.51, 256.59],
  h: [327.85, 327.22],
  l: [292.75, 254.99],
  o: [296.24, 304.3],
  s: 'ok',
  t: [1577854800, 1580533200],
  v: [908559107, 811232864],
};
