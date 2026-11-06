---
title: Template variables
description: 'Use template variables with Finnhub to build dynamic, reusable dashboards.'
keywords:
  - 'Finnhub'
  - data source
  - template variables
sidebar_position: 4
---

Use template variables to create dynamic, reusable dashboards that let you change query parameters without editing individual panels. For general information about template variables, refer to [Templates and variables](https://grafana.com/docs/grafana/latest/dashboards/variables/).

## Before you begin

- [Configure the Finnhub data source](./configure.md).
- Understand [Grafana template variables](https://grafana.com/docs/grafana/latest/dashboards/variables/).
- Know how to write queries in the [Finnhub query editor](./query-editor.md).

## Supported variable types

The Finnhub data source supports the following variable types:

| Variable type  | Supported |
| -------------- | --------- |
| Query          | Yes       |
| Custom         | Yes       |
| Data source    | Yes       |
| Ad hoc filters | No        |

## Use variables in queries

Variables work in the **Symbol**, **Search**, **Exchange** and **Category** fields, written as `$variable` or `${variable}`.

- The plugin replaces each of those fields with one string, so use single-value variables.
- The plugin uppercases **Symbol** after it replaces the variable.
- **Resolution**, **Metric** and **Free Query Text** don't interpolate variables.

For example, add a text box variable named `symbol` with the value `AAPL`, then set **Symbol** in a panel to `$symbol`. The panel queries the symbol the variable holds.

Annotation queries interpolate the same four fields as panel queries do.

## Query variables

A query variable fills its drop-down by running a query against Finnhub, so its options stay current with your data. Use one to let viewers pick a value, such as a ticker, and update every panel that uses it.

To create a query variable:

1. Navigate to **Dashboard settings** > **Variables**.
1. Click **Add variable**.
1. Select **Query** as the variable type.
1. Select the **Finnhub** data source.
1. Choose a **Data type**.
1. Fill the fields the type shows, such as **Symbol** or **Search**.

The variable editor is the same query editor as a panel uses, with the same fields and the same data types.

The first string field of the query result becomes both the option value and the option text. Add a **Symbol lookup** or **Peers** query to list tickers, because both types return a string field.

For example, to list the peers of a company:

1. Add a text box variable named `search` with a company name as its value.
1. Add a query variable named `company`, set **Data type** to **Symbol lookup** and set **Search** to `$search`. The options are the matching tickers.
1. Add a query variable named `peer`, set **Data type** to **Peers** and set **Symbol** to `$company`. The options are the peer tickers.
1. Use `$peer` in the **Symbol** field of a panel query.

Grafana stores the `peer` variable query as this target:

```json
{
  "refId": "PeerVar",
  "type": "peers",
  "symbol": "$company",
  "search": "",
  "resolution": "1",
  "metric": "price",
  "exchange": "US",
  "category": "general"
}
```

**Trades** opens a stream and returns no response body to shape, so you can't use it as a variable source.
