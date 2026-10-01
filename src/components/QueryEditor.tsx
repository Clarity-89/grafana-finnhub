import React, { ChangeEvent, KeyboardEvent } from 'react';
import { Combobox, ComboboxOption, Field, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../DataSource';
import { normalizeQuery, QueryTypeDef, queryTypes } from '../queryTypes';
import { MyDataSourceOptions, MyQuery, QueryInput, QueryType } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// Object.keys loses the key union; the registry is declared over exactly QueryType.
const typeOptions: Array<ComboboxOption<QueryType>> = (Object.keys(queryTypes) as QueryType[]).map((value) => {
  const { label, premium }: QueryTypeDef = queryTypes[value];
  return { value, label, group: premium ? 'Premium' : 'Free' };
});

const metricOptions: ComboboxOption[] = [
  'price',
  'valuation',
  'growth',
  'margin',
  'management',
  'financialStrength',
  'perShare',
].map((value) => ({ value }));

const resolutionOptions: ComboboxOption[] = [
  { value: '1' },
  { value: '5' },
  { value: '15' },
  { value: '30' },
  { value: '60' },
  { value: 'D', label: 'Day' },
  { value: 'W', label: 'Week' },
  { value: 'M', label: 'Month' },
];

const categoryOptions: ComboboxOption[] = ['general', 'forex', 'crypto', 'merger'].map((value) => ({ value }));

const searchOptions = async (datasource: DataSource, text: string): Promise<ComboboxOption[]> =>
  (await datasource.searchSymbols(text)).map(({ symbol, displaySymbol, description }) => ({
    value: symbol,
    label: displaySymbol,
    description,
  }));

export const QueryEditor = ({ datasource, onChange, onRunQuery, query: saved }: Props) => {
  const query = normalizeQuery(saved);
  const def: QueryTypeDef = queryTypes[query.type];
  const has = (input: QueryInput) => def.inputs.includes(input);
  const isRest = 'path' in def;
  const update = (patch: Partial<MyQuery>) => onChange({ ...query, ...patch });
  const runOnEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      onRunQuery();
    }
  };

  return (
    <>
      <Field label="Data type" description={def.description}>
        <Combobox
          id="finnhub-type"
          options={typeOptions}
          value={query.type}
          onChange={(option) => update({ type: option.value })}
        />
      </Field>
      {has('symbol') && (
        <Field label="Symbol">
          <Combobox
            id="finnhub-symbol"
            isClearable
            createCustomValue
            placeholder="Ticker or company name"
            options={(text) => searchOptions(datasource, text)}
            value={query.symbol ? { value: query.symbol, label: query.symbol } : null}
            onChange={(option) => {
              update({ symbol: option?.value ?? '' });
              onRunQuery();
            }}
          />
        </Field>
      )}
      {has('search') && (
        <Field label="Search">
          <Input
            id="finnhub-search"
            value={query.symbol}
            placeholder="Ticker, company name, ISIN or CUSIP"
            onChange={(event: ChangeEvent<HTMLInputElement>) => update({ symbol: event.target.value })}
            onKeyDown={runOnEnter}
          />
        </Field>
      )}
      {has('resolution') && (
        <Field label="Resolution">
          <Combobox
            id="finnhub-resolution"
            options={resolutionOptions}
            value={query.resolution}
            onChange={(option) => {
              update({ resolution: option.value });
              onRunQuery();
            }}
          />
        </Field>
      )}
      {has('metric') && (
        <Field label="Metric">
          <Combobox
            id="finnhub-metric"
            options={metricOptions}
            value={query.metric}
            onChange={(option) => {
              update({ metric: option.value });
              onRunQuery();
            }}
          />
        </Field>
      )}
      {has('exchange') && (
        <Field label="Exchange">
          <Input
            id="finnhub-exchange"
            value={query.exchange}
            placeholder="Exchange code, e.g. US"
            onChange={(event: ChangeEvent<HTMLInputElement>) => update({ exchange: event.target.value })}
            onKeyDown={runOnEnter}
          />
        </Field>
      )}
      {has('category') && (
        <Field label="Category">
          <Combobox
            id="finnhub-category"
            options={categoryOptions}
            value={query.category}
            onChange={(option) => {
              update({ category: option.value });
              onRunQuery();
            }}
          />
        </Field>
      )}
      {isRest && (
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
