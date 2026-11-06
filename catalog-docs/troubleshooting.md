---
title: Troubleshooting
description: 'Troubleshoot common Finnhub connection, authentication and query errors.'
keywords:
  - 'Finnhub'
  - data source
  - troubleshooting
sidebar_position: 8
---

This page explains how to fix common issues when you configure or use the Finnhub data source. For setup instructions, refer to [Configure the Finnhub data source](./configure.md).

## Connection errors

These errors mean Grafana couldn't get a usable response from Finnhub.

### "Error retrieving data"

**Symptoms:** **Save & test** fails with a message that starts with `Error retrieving data:`.

**Possible causes and solutions:**

| Cause                                       | Solution                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| The API token is invalid or was revoked.    | Click **Reset** in the data source settings and enter the token again.                             |
| Grafana can't reach Finnhub.                | Check that Grafana has outbound access to `https://finnhub.io`.                                    |
| Finnhub returned an error for the request.  | Read the reason after the colon, which Finnhub or the Grafana proxy wrote, and check the token's plan. |

### "WebSocket error"

**Symptoms:** A panel with the **Trades** data type shows `WebSocket error`.

**Possible causes and solutions:**

| Cause                                                 | Solution                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Grafana can't open `wss://ws.finnhub.io`.             | Check that Grafana has outbound websocket access to `wss://ws.finnhub.io`.                 |
| A proxy between Grafana and Finnhub blocks websockets. | Allow websocket connections in the proxy settings.                                        |
| The API token is invalid.                             | Click **Reset** in the data source settings and enter the token again.                     |

## Authentication errors

The reason after `Error retrieving data:` comes from the Grafana proxy or from Finnhub. When the reason reports an authentication failure, the token is invalid or lacks access to the endpoint. Click **Reset** and enter the token again.

The premium data types, **Candle** and **Social sentiment**, fail when the token is on a free Finnhub plan. Use a token from a premium plan or choose a Free data type.

## Query errors

These errors appear in a panel or in the query inspector after a query runs.

- **Trades shows no points:** **Symbol** may be empty, the symbol may have no recent trades, or the market may be closed. Enter a stream symbol, for example `BINANCE:BTCUSDT` for a cryptocurrency pair.
- **Candle returns an empty panel:** Finnhub reports `no_data` for that range and resolution. Widen the dashboard time range or choose another **Resolution**.
- **Company news is empty:** free API keys cover about one year of history. Use a dashboard time range inside that window.
- **Earnings calendar is empty:** free API keys cover about one month of history. Clear **Symbol** to query the whole market.
- **Symbol lookup suggests nothing:** the field is empty or holds a template expression. The plugin doesn't call Finnhub search for blank or template values, so type a term or use a variable value.
- **Free Query Text fails:** the path must sit under `/api/v1` and include a valid query string. The plugin doesn't validate the text, so Finnhub returns the error for the path.

## Template variable errors

Refer to [Template variables](./template-variables.md) for how the data source supports them.

- **A query variable has no options:** the query must return a string field. Use **Symbol lookup** or **Peers**, whose first string field becomes the option value.
- **A variable in a field doesn't change the query:** only **Symbol**, **Search**, **Exchange** and **Category** interpolate variables. **Resolution**, **Metric** and **Free Query Text** don't.
- **Trades is missing from the data types:** it streams prices instead of returning a response body, so it can't fill a variable.

## Annotation errors

Refer to [Annotations](./annotations.md) for the fields each data type returns.

- **Markers don't appear:** the data type must return a `time` field. **Profile** and **Metric** don't, and **Trades** is a stream. Check that the dashboard time range includes the events.
- **Company news markers are missing for older events:** free API keys cover about one year of history.

## Streaming and refresh behavior

- The plugin doesn't cache query results, so every dashboard refresh sends new requests to Finnhub. Lower the refresh rate or the number of panels that query Finnhub to stay inside your Finnhub plan's limits.
- **Trades** keeps the last 1000 prices of each stream and holds a websocket open while the panel runs. Limit the number of simultaneous **Trades** panels.

## Get more detail about an error

To see the raw request and response for a panel, open the panel editor and click **Query inspector**.

## Get additional help

If this page doesn't solve your problem:

- Search the [Grafana community forums](https://community.grafana.com/).
- Search the [plugin issue tracker](https://github.com/Clarity-89/grafana-finnhub/issues) and open an issue.
- Refer to the [Finnhub API documentation](https://finnhub.io/docs/api) for the endpoint and its parameters.
- If your Grafana Cloud or Grafana Enterprise plan includes support, contact Grafana Support.

When you report an issue, include:

- The Grafana and plugin versions.
- The error message, with sensitive information removed.
- The steps to reproduce the issue.
- The relevant data source settings, with credentials removed.
