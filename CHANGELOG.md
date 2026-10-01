## 0.8.0

- Fix: require Grafana 10.1 or later; 0.7.0 failed to load on 10.0.x
- Fix: keep every trade in a websocket message instead of only the first
- Fix: trades panels no longer report "Data outside time range" seconds after starting; packets are marked as streaming
- Fix: label candle series (Opening price, High price, ...) instead of `o`, `h`, `l`, `c`, `v`
- Fix: pre-select the default candle resolution in the query editor
- Fix: stop sending the panel `refId` to Finnhub as a query parameter
- Fix: mark social sentiment as premium alongside candles
- Fix: show the proxy or Finnhub error message when testing the data source
- Queries now store plain values for type, metric and resolution. Existing dashboards keep working and migrate on their next edit
- Free text queries always use the generic response shaper, regardless of the selected data type
- Replace the sample dashboard with one covering every query type and a `$symbol` variable
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
