## 1.0.0

- Require Grafana 12.4 or later (0.7.0 also failed to load on 10.0.x, which lacks `createDataFrame`)
- Add the free endpoints: recommendation trends, company news, market news, SEC filings, insider sentiment, insider transactions, earnings calendar, IPO calendar, market holidays, market status, symbol lookup and peers
- Annotations: company news, filings and calendars can mark any dashboard panel (news carries headline, summary and source tag)
- Query variables: fill `$symbol`-style variables from the data source, for example peers of the selected symbol
- The Symbol field searches Finnhub as you type; custom values such as `$symbol` still work, and clearing it queries the whole market where supported
- A Run query button in the query editor; selections run at once and text inputs also run on Enter
- The Data type menu groups entries as Free and Premium and shows Finnhub's limits for the selected type
- Add `exchange` (market status, holidays) and `category` (market news) query fields
- Date-only values and timezone-free timestamps are read as UTC, so points land identically in every browser. Earnings and social sentiment points shift by the browser's UTC offset compared with 0.7
- List endpoints keep their typed columns when Finnhub returns nothing or only nulls
- Replace the sample dashboard with one covering every query type, a company news annotation and `symbol` / `peer` variables
- Replace deprecated `Select` with `Combobox` in the query editor
- Build the trades frame with `createDataFrame` instead of the deprecated `CircularDataFrame`
- Take `DataQuery` from `@grafana/schema`; the `@grafana/data` alias is deprecated
- Queries now store plain values for type, metric and resolution. Existing dashboards keep working and migrate on their next edit
- Free text queries always use the generic response shaper, regardless of the selected data type
- Fix: keep every trade in a websocket message instead of only the first
- Fix: trades panels no longer report "Data outside time range" seconds after starting; packets are marked as streaming
- Fix: label candle series (Opening price, High price, ...) instead of `o`, `h`, `l`, `c`, `v`
- Fix: pre-select the default candle resolution in the query editor
- Fix: stop sending the panel `refId` to Finnhub as a query parameter
- Fix: mark social sentiment as premium alongside candles
- Fix: show the proxy or Finnhub error message when testing the data source
- Remove unused dependencies; the bundle no longer ships `lodash.capitalize`

## 0.7.0

- Update the plugin to be compatible with Grafana 12
- Replace deprecated `MutableDataFrame` with `createDataFrame`
- Remove wildcard method from datasource proxy routes
- Upgrade GitHub Actions and pin to commit SHAs
- Update Node.js to 22 (LTS) and Go to 1.24 in CI workflows
- Remove accidental `g` dependency

## 0.6.0

- Add support for `$symbol` variable

## 0.5.0

- Remove @grafana/ui Form usage
- Update React to v.18
- Remove unused dependencies

## 0.4.1

- Remove `grafanaVersion` from `plugin.json`
- Update `grafanaDependency` in `plugin.json`

## 0.4.0

- Update the plugin to be compatible with Grafana 10

## 0.3.2

- Update dependencies

## 0.3.1

- Restore trades endpoint (websocket)

## 0.3.0

- Store API token in secure field
- Temporarily disabled trades websocket endpoint due to proxy auth issue (quote query with dashboard refresh can be used as a workaround).

## 0.2.1

- Update the plugin to be compatible with Grafana 8
- Add social sentiment endpoint support

## 0.1.1

- Initial release
