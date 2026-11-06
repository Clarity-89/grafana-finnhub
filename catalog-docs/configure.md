---
title: Configure
description: 'Add the Finnhub data source in Grafana and connect it to your service.'
keywords:
  - 'Finnhub'
  - data source
  - configuration
  - provisioning
sidebar_position: 2
---

This document explains how to add and configure the Finnhub data source in Grafana. After you configure the data source, refer to the [Finnhub query editor](./query-editor.md) to start querying your data.

## Before you begin

Before you configure the data source, ensure you have:

- **Grafana permissions:** The `Organization administrator` role. Only organization administrators can add data sources.
- **Grafana version:** Grafana 12.4.0 or later. The plugin declares `grafanaDependency` as `>=12.4.0` in `src/plugin.json`.
- **Finnhub API token:** A token from [Finnhub](https://finnhub.io/). A free token works with the Free data types; **Candle** and **Social sentiment** need a premium Finnhub plan.
- **Network access:** Grafana must reach `https://finnhub.io` for REST queries and `wss://ws.finnhub.io` for the Trades stream.

## Set up access in Finnhub

1. Sign in to [Finnhub](https://finnhub.io/) and open your Finnhub dashboard.
1. Copy the API token.

The plan behind the token controls which data types work. A premium data type fails when the token is on a free plan.

## Add the data source

<!-- snippet:add-data-source -->

To add the Finnhub data source:

1. Click **Connections** in the left-side menu.
1. Click **Add new connection**.
1. Enter `Finnhub` in the search bar.
1. Select **Finnhub**.
1. Click **Add new data source**.

<!-- /snippet:add-data-source -->

## Configure settings

| Setting         | Description                                                                                                                                                                                                                                                                                                  | Required |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **API Token**   | Finnhub API token. Grafana stores it as secure data and sends it as the `X-Finnhub-Token` header for REST requests and the `token` parameter for the websocket. After you save, the field shows `Configured`; click **Reset** to enter a new token. | Yes      |

The editor has no URL, TLS or proxy settings. Queries go through the Grafana proxy to Finnhub's fixed endpoints.

## Verify the connection

Click **Save & test** to verify the connection.

- Success returns `Data source is working`. The test requests the `AAPL` profile from `stock/profile2`.
- Failure returns `Error retrieving data: <reason>`, where the reason comes from the Grafana proxy or Finnhub. Refer to [Troubleshooting](./troubleshooting.md) for the causes and fixes.

## Provision the data source

You can provision the Finnhub data source with a Grafana provisioning file.

### Provision with a configuration file

You can define the data source in a YAML file as part of the Grafana provisioning system. For more information, refer to [Provision Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

The example uses one placeholder:

| Placeholder               | Replace with            |
| ------------------------- | ----------------------- |
| `${FINNHUB_API_TOKEN}`    | The Finnhub API token.  |

```yaml
apiVersion: 1

datasources:
  - name: Finnhub
    type: clarity89-finnhub-datasource
    access: proxy
    secureJsonData:
      apiToken: ${FINNHUB_API_TOKEN}
```

| Key                       | Sets                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| `name`                    | The display name of the data source in Grafana.                             |
| `type`                    | The plugin ID, `clarity89-finnhub-datasource`.                              |
| `access`                  | `proxy`, so Grafana sends the queries through its own proxy.                |
| `secureJsonData.apiToken` | The Finnhub API token, stored encrypted and never returned to the browser.  |

The plugin has no `jsonData` settings, so the provisioning file has no `jsonData` block.
