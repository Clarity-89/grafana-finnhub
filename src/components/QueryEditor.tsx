import React, { ChangeEvent, KeyboardEvent } from 'react';
import { Field, Input, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../DataSource';
import { normalizeQuery, QueryTypeDef, queryTypes } from '../queryTypes';
import { MyDataSourceOptions, MyQuery, QueryType } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// Object.keys loses the key union; the registry is declared over exactly QueryType.
const typeOptions = (Object.keys(queryTypes) as QueryType[]).map((value) => {
  const { label, premium }: QueryTypeDef = queryTypes[value];
  return { value, label: premium ? `${label} (Premium)` : label };
});

const metricOptions = ['price', 'valuation', 'growth', 'margin', 'management', 'financialStrength', 'perShare'].map(
  (value) => ({ value, label: value })
);

const resolutionOptions = [
  { value: '1', label: '1' },
  { value: '5', label: '5' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
  { value: 'D', label: 'Day' },
  { value: 'W', label: 'Week' },
  { value: 'M', label: 'Month' },
];

export const QueryEditor = ({ onChange, onRunQuery, query: saved }: Props) => {
  const query = normalizeQuery(saved);
  const update = (patch: Partial<MyQuery>) => onChange({ ...query, ...patch });
  const runOnEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      onRunQuery();
    }
  };

  return (
    <>
      <Field label="Data type">
        <Select
          inputId="finnhub-type"
          options={typeOptions}
          value={query.type}
          onChange={(item: SelectableValue<QueryType>) => update({ type: item.value })}
        />
      </Field>
      <Field label="Symbol">
        <Input
          id="finnhub-symbol"
          value={query.symbol}
          placeholder="Stock symbol"
          onChange={(event: ChangeEvent<HTMLInputElement>) => update({ symbol: event.target.value })}
          onKeyDown={runOnEnter}
        />
      </Field>
      {query.type === 'candle' && (
        <Field label="Resolution">
          <Select
            inputId="finnhub-resolution"
            options={resolutionOptions}
            value={query.resolution}
            onChange={(item) => update({ resolution: item.value })}
          />
        </Field>
      )}
      {query.type === 'metric' && (
        <Field label="Metric">
          <Select
            inputId="finnhub-metric"
            options={metricOptions}
            value={query.metric}
            onChange={(item) => update({ metric: item.value })}
          />
        </Field>
      )}
      {query.type !== 'trades' && (
        <Field label="Free Query Text" description="Experimental. Will override any selected values above.">
          <Input
            id="finnhub-query-text"
            value={query.queryText ?? ''}
            placeholder="Custom query e.g. 'stock/earnings?symbol=AAPL'"
            onChange={(event: ChangeEvent<HTMLInputElement>) => update({ queryText: event.target.value })}
            onKeyDown={runOnEnter}
          />
        </Field>
      )}
    </>
  );
};
