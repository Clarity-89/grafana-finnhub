export const TIMESERIES_QUERY_TYPES = ['quote', 'earnings', 'candle', 'trades', 'social-sentiment'];
export const TABLE_QUERY_TYPES = ['profile2', 'metric'];

export const stockMetrics = ['price', 'valuation', 'growth', 'margin', 'management', 'financialStrength', 'perShare'];
export const candleFields = new Map([
  ['o', 'Opening price'],
  ['h', 'High price'],
  ['l', 'Low price'],
  ['c', 'Closing price'],
  ['v', 'Traded volume'],
  ['t', 'Time'],
]);
