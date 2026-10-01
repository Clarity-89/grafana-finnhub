## Data Source Grafana plugin for [Finnhub](https://finnhub.io/).

Before starting, it's necessary to get an API token from [Finnhub](https://finnhub.io/) and paste it to the "API Token" field in the plugin settings.

### Supported queries

#### Free API

- [Company profile](https://finnhub.io/docs/api#company-profile2)
- [Quote](https://finnhub.io/docs/api#quote)
- [Earnings surprises](https://finnhub.io/docs/api#company-earnings)
- [Basic Financials](https://finnhub.io/docs/api#company-basic-financials)
- [Recommendation trends](https://finnhub.io/docs/api/recommendation-trends)
- [Company news](https://finnhub.io/docs/api/company-news)
- [Market news](https://finnhub.io/docs/api/market-news)
- [SEC filings](https://finnhub.io/docs/api/filings)
- [Insider sentiment](https://finnhub.io/docs/api/insider-sentiment)
- [Insider transactions](https://finnhub.io/docs/api/insider-transactions)
- [Earnings calendar](https://finnhub.io/docs/api/earnings-calendar)
- [IPO calendar](https://finnhub.io/docs/api/ipo-calendar)
- [Market holidays](https://finnhub.io/docs/api/market-holiday)
- [Market status](https://finnhub.io/docs/api/market-status)
- [Symbol lookup](https://finnhub.io/docs/api/symbol-search)
- [Peers](https://finnhub.io/docs/api/company-peers)
- [Trades](https://finnhub.io/docs/api#websocket-trades)

#### Premium API

- [Stock candles](https://finnhub.io/docs/api#stock-candles)
- [Social Sentiment](https://finnhub.io/docs/api/social-sentiment)

Date-ranged endpoints use the dashboard time range. Finnhub's dates are read as UTC.

### Annotations

Pick the data source as an annotation source and choose a type. Company news marks each headline with its summary and source as a tag. Filings and calendars mark their dates.

### Variables

Query variables run any data type and take the first text column as options. `Peers` with symbol `$symbol` lists the peers of the selected company; `Symbol lookup` turns a search term into tickers.

### Sample dashboard

`provision/dashboard.json` covers every query type, a company news annotation and a `peer` variable. Import it from Dashboards → New → Import, or [provision](https://grafana.com/tutorials/provision-dashboards-and-data-sources) it.
