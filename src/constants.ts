export const TIMESERIES_QUERY_TYPES = ['quote', 'earnings', 'candle', 'trades', 'social-sentiment'];
export const TABLE_QUERY_TYPES = ['profile2', 'metric'];
// Queries that only work with a premium API key
export const PREMIUM_QUERIES = ['candle'];
export const stockMetrics = ['price', 'valuation', 'growth', 'margin', 'management', 'financialStrength', 'perShare'];
export const candleFields = new Map([
  ['o', 'Opening price'],
  ['h', 'High price'],
  ['l', 'Low price'],
  ['c', 'Closing price'],
  ['v', 'Traded volume'],
  ['t', 'Time'],
]);
