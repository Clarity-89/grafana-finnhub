---
title: Annotations
description: 'Mark events on your graphs with annotation queries from Finnhub.'
keywords:
  - 'Finnhub'
  - data source
  - annotations
sidebar_position: 5
---

Annotations overlay event markers on time series panels, so you can correlate events from Finnhub, such as deployments or incidents, with the metrics on your dashboards. For general information about annotations, refer to [Annotate visualizations](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/).

## Before you begin

- [Configure the Finnhub data source](./configure.md).
- A data type that returns a `time` field. **Profile**, **Metric**, **Symbol lookup** and **Peers** return none, so they can't mark events.
- An understanding that **Trades** can't be an annotation source, because it streams prices instead of returning a response body.

## Create an annotation query

To add an annotation query to a dashboard:

1. Navigate to **Dashboard settings** > **Annotations**.
1. Click **Add annotation query**.
1. Enter a **Name** for the annotation.
1. Select the **Finnhub** data source.
1. Choose a **Data type**. A new annotation query uses **Company news**.
1. Fill the fields of that type, for example **Symbol** for company news or **Exchange** for market holidays.
1. Save the dashboard.

The annotation editor is the same query editor as a panel uses, with no annotation-specific fields.

## Query requirements

Grafana maps the annotation fields by name, and the plugin returns these fields:

| Field   | Required | Description                                                                                       |
| ------- | -------- | ------------------------------------------------------------------------------------------------- |
| `time`  | Yes      | The time of the marker.                                                                           |
| `title` | No       | The title of the marker. **Company news** uses `headline`.                                        |
| `text`  | No       | The text of the marker. **Company news** uses `summary`; other types fall back to the first string field. |
| `tags`  | No       | The tags of the marker. **Company news** uses `source`.                                           |

The mapping for each data type:

- **Company news** and **Market news** read `time` from `datetime` and return `headline`, `summary` and `source` as `title`, `text` and `tags`, plus a `url` field.
- **SEC filings** read `time` from `filedDate`. The first string field, `form`, becomes the marker text.
- **Insider transactions** read `time` from `transactionDate`. `name` becomes the marker text.
- **Earnings calendar** reads `time` from `date`. `symbol` becomes the marker text.
- **IPO calendar** reads `time` from `date`. `symbol` becomes the marker text.
- **Market holidays** read `time` from `atDate`. `eventName` becomes the marker text.
- **Quote** reads `time` from `t` and carries the current price. It has no title or text.
- **Insider sentiment** places a marker on the first day of each month and carries no title or text.
- **Market status** reads `time` from `t`. `session` becomes the marker text.

The plugin returns no `timeEnd` field, so each annotation is a point marker rather than a region.

The date-ranged data types query the dashboard time range. Some of them are limited by the Finnhub API:

- **Company news** covers about one year of history on free API keys.
- **SEC filings** returns at most 250 filings.
- **Insider transactions** returns at most 100 transactions.

## Annotation query examples

### Company news for a dashboard variable

1. Navigate to **Dashboard settings** > **Annotations**.
1. Click **Add annotation query**.
1. Enter a **Name** for the annotation.
1. Select the **Finnhub** data source.
1. Set **Data type** to **Company news** and **Symbol** to `$symbol`.
1. Save the dashboard.

Each headline in the dashboard time range becomes a marker with the summary as its text and the source as its tag. Grafana stores the annotation as this target:

```json
{
  "refId": "Anno",
  "type": "company-news",
  "symbol": "$symbol",
  "search": "",
  "resolution": "1",
  "metric": "price",
  "exchange": "US",
  "category": "general"
}
```

### Earnings calendar for the whole market

1. Add an annotation query and select the **Finnhub** data source.
1. Set **Data type** to **Earnings calendar**.
1. Clear **Symbol**, so the annotation marks the earnings of every listed company.
1. Set the dashboard time range to the reporting period you want to see.

### IPO calendar

1. Add an annotation query and select the **Finnhub** data source.
1. Set **Data type** to **IPO calendar**.
1. Set the dashboard time range.

Each IPO date in the range becomes a marker, with the symbol as its text.
