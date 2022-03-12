## Data Source Grafana plugin for [Finnhub](https://finnhub.io/).

Before starting, it's necessary to get an API token from [Finnhub](https://finnhub.io/) and paste it to the "API Token" field in the plugin settings.

#### Currently supported queries:
- [Company profile](https://finnhub.io/docs/api#company-profile2)
- [Quote](https://finnhub.io/docs/api#quote)
- [Earnings surprises](https://finnhub.io/docs/api#company-earnings)
- [Stock candles](https://finnhub.io/docs/api#stock-candles)
- [Basic Financials](https://finnhub.io/docs/api#company-basic-financials)
- [Trades](https://finnhub.io/docs/api#websocket-trades)
- [Social Sentiment](https://finnhub.io/docs/api/social-sentiment)
 
A sample dashboard provisioning file is available at `provision/dashboard.json`. [Read more](https://grafana.com/tutorials/provision-dashboards-and-data-sources) about dashboards provisioning. 
