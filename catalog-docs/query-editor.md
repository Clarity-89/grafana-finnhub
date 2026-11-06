---
title: Query editor
description: 'Build and run queries with the Finnhub query editor.'
keywords:
  - 'Finnhub'
  - data source
  - query editor
  - queries
sidebar_position: 3
---

This document explains how to use the Finnhub query editor to build queries and visualize Finnhub data in Grafana dashboards.

## Before you begin

- [Configure the Finnhub data source](./configure.md).
- A premium Finnhub API plan for the **Candle** and **Social sentiment** data types.
- An understanding of the dashboard time range, because the date-ranged data types query it.

## Query types

| Field              | Description                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data type**      | The endpoint to query. The list groups the Free and Premium types, and the premium types need a premium plan.                                                                                           |
| **Symbol**         | A ticker or a company name. Suggestions come from Finnhub symbol search, and you can type any ticker. Template values are uppercased before the request.                                               |
| **Search**         | A ticker, company name, ISIN or CUSIP for **Symbol lookup**. Press Enter or click **Run query** to run it.                                                                                              |
| **Resolution**     | The candle bar size: `1`, `5`, `15`, `30` or `60` minutes, or **Day**, **Week** or **Month**. Default `1`.                                                                                               |
| **Metric**         | The metric group for **Metric**: `price`, `valuation`, `growth`, `margin`, `management`, `financialStrength` or `perShare`. Default `price`.                                                             |
| **Exchange**       | The Finnhub exchange code for **Market holidays** and **Market status**, for example `US`. Default `US`.                                                                                                 |
| **Category**       | The market news category: `general`, `forex`, `crypto` or `merger`. Default `general`.                                                                                                                  |
| **Free Query Text**| Experimental. A path and query string under `/api/v1`, for example `stock/earnings?symbol=AAPL`. It overrides every field above. It isn't shown for **Trades**.                                          |

Selections apply and run immediately, while text inputs wait for Enter or the **Run query** button. Changing **Data type** runs the query when the inputs of the new type already have values; otherwise the editor waits for you to fill them.

### Quote

Uses **Symbol**. Returns the current price and its timestamp as a table.

### Profile

Uses **Symbol**. Returns the company profile as a one-row table.

### Earnings

Uses **Symbol**. Returns the last four quarters on free API keys, with the actual and estimated earnings per share, the surprise, the surprise percent, the quarter and the year.

### Metric

Uses **Symbol** and **Metric**. Returns the selected metric group as a one-row table.

### Recommendation trends

Uses **Symbol**. Returns the strong buy, buy, hold, sell and strong sell counts by period.

### Company news

Uses **Symbol**. Queries the dashboard time range, where free API keys cover about one year of history. Returns the headline, the summary, the source and the article URL.

### Market news

Uses **Category**. Returns the latest headlines and ignores the dashboard time range.

### SEC filings

Uses **Symbol**. Returns up to 250 filings in the dashboard time range, with the form, the accession number, the report link and the filing link.

### Insider sentiment

Uses **Symbol**. Returns the monthly change and the monthly share purchase ratio (MSPR) in the dashboard time range.

### Insider transactions

Uses **Symbol**. Returns up to 100 transactions in the dashboard time range, with the name, the transaction code, the change, the share, the price and the filing date.

### Earnings calendar

Uses **Symbol**, which is optional. Clear it to query the whole market. Free API keys cover about one month of history. Queries the dashboard time range.

### IPO calendar

Takes no inputs. Returns the IPO events in the dashboard time range.

### Market holidays

Uses **Exchange**. Returns the holidays and the trading hours of that exchange.

### Market status

Uses **Exchange**. Returns the current status and ignores the dashboard time range.

### Symbol lookup

Uses **Search**. Searches by ticker, company name, ISIN or CUSIP. The first column of the result is `symbol`.

### Peers

Uses **Symbol**. Returns the peer tickers of the symbol.

### Trades

Uses **Symbol**. Opens a live websocket stream and keeps the last 1000 prices. You can't use it as an annotation or a variable source.

### Candle (Premium)

Uses **Symbol** and **Resolution**. Returns OHLCV bars over the dashboard time range.

### Social sentiment (Premium)

Uses **Symbol**. Returns the social sentiment by network over the dashboard time range.

## Format the query results

Each data type returns a fixed data frame, and the editor has no **Format** option.

| Data types                                                                                 | Result                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quote                                                                                      | A table with the `time` and `current price` fields.                                                                                                                                   |
| Profile, Metric                                                                            | A one-row table with one column per Finnhub field.                                                                                                                                    |
| Earnings, Recommendation trends, Insider sentiment, Candle, Social sentiment                | A time series. **Candle** returns the Opening price, High price, Low price, Closing price and Traded volume series. **Social sentiment** returns one frame per network, with the metric names suffixed by the network. |
| Company news, Market news                                                                  | A table with the `time`, `title`, `text`, `tags` and `url` fields.                                                                                                                    |
| SEC filings, Insider transactions, Earnings calendar, IPO calendar, Market holidays, Market status, Symbol lookup, Peers | A table.                                                                                                       |
| Trades                                                                                     | A streaming time series with the `ts` and `value` fields, capped at 1000 points.                                                                                                      |
| Free Query Text                                                                            | A best-effort table or series, with one field per top-level response key. The `t`, `time` and `period` keys are read as Unix seconds.                                                  |

## Query examples

### Quote for a ticker

1. Set **Data type** to **Quote**.
1. Enter `AAPL` in **Symbol**.
1. Click **Run query**.

Grafana stores the query as this target:

```json
{
  "datasource": { "type": "clarity89-finnhub-datasource", "uid": "${DS_FINNHUB}" },
  "refId": "A",
  "type": "quote",
  "symbol": "AAPL",
  "search": "",
  "resolution": "1",
  "metric": "price",
  "exchange": "US",
  "category": "general"
}
```

### Company news for a dashboard variable

1. Set **Data type** to **Company news**.
1. Enter `$symbol` in **Symbol**.
1. Set the dashboard time range to the period you want to cover.

The plugin uppercases the interpolated symbol, so the value of `$symbol` can be lowercase.

### Earnings calendar for the whole market

1. Set **Data type** to **Earnings calendar**.
1. Clear **Symbol**, so the editor queries every symbol.
1. Set the dashboard time range.

### Live trades for a cryptocurrency pair

1. Set **Data type** to **Trades**.
1. Enter `BINANCE:BTCUSDT` in **Symbol**.
1. Click **Run query** and leave the panel open to keep the stream running.

### Free Query Text for earnings surprises

1. Set **Data type** to **Earnings**.
1. Enter `stock/earnings?symbol=AAPL` in **Free Query Text**.
1. Press Enter or click **Run query**.

The plugin sends the text as the path under `/api/v1` and reads the response with its generic shape, so the target stores `"type": "earnings"` together with `"queryText": "stock/earnings?symbol=AAPL"`.
