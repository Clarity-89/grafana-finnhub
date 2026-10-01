import React, { ChangeEvent, KeyboardEvent } from 'react';
import { Combobox, ComboboxOption, Field, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../DataSource';
import { normalizeQuery, QueryTypeDef, queryTypes } from '../queryTypes';
import { MyDataSourceOptions, MyQuery, QueryInput, QueryType } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// Object.keys loses the key union; the registry is declared over exactly QueryType.
const typeKeys = Object.keys(queryTypes) as QueryType[];
const defOf = (type: QueryType): QueryTypeDef => queryTypes[type];

// Combobox orders groups by first appearance, so every free type is listed before the premium ones.
const typeOptions: Array<ComboboxOption<QueryType>> = [false, true].flatMap((premium) =>
  typeKeys
    .filter((value) => Boolean(defOf(value).premium) === premium)
    .map((value) => ({ value, label: defOf(value).label, group: premium ? 'Premium' : 'Free' }))
);

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
  const def = defOf(query.type);
  const has = (input: QueryInput) => def.inputs.includes(input);
  const isRest = 'path' in def;
  const update = (patch: Partial<MyQuery>) => onChange({ ...query, ...patch });
  /** Selections apply at once; text inputs wait for Enter. */
  const commit = (patch: Partial<MyQuery>) => {
    update(patch);
    onRunQuery();
  };
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
          onChange={(option) => {
            // A type whose input is still empty waits for the user to type it.
            const filled = defOf(option.value).inputs.every((input) => query[input] !== '');
            (filled ? commit : update)({ type: option.value });
          }}
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
            onChange={(option) => commit({ symbol: option?.value ?? '' })}
          />
        </Field>
      )}
      {has('search') && (
        <Field label="Search">
          <Input
            id="finnhub-search"
            value={query.search}
            placeholder="Ticker, company name, ISIN or CUSIP"
            onChange={(event: ChangeEvent<HTMLInputElement>) => update({ search: event.target.value })}
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
            onChange={(option) => commit({ resolution: option.value })}
          />
        </Field>
      )}
      {has('metric') && (
        <Field label="Metric">
          <Combobox
            id="finnhub-metric"
            options={metricOptions}
            value={query.metric}
            onChange={(option) => commit({ metric: option.value })}
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
            onChange={(option) => commit({ category: option.value })}
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
