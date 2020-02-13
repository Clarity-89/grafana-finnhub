import React, { FC, ChangeEvent } from 'react';
import capitalize from 'lodash.capitalize';
import { FormField, FormLabel, Segment } from '@grafana/ui';
import { ExploreQueryFieldProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../DataSource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from '../types';

type Props = ExploreQueryFieldProps<DataSource, MyQuery, MyDataSourceOptions>;

const queryTypes = ['profile', 'quote', 'exchange', 'metric', 'earnings'];

export const QueryEditor: FC<Props> = ({ onChange, onRunQuery, query }) => {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, symbol: event.target.value });
  };

  const onTypeChange = (item: SelectableValue) => {
    onChange({ ...query, queryType: item });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onRunQuery();
    }
  };

  const dataTypes = queryTypes.map(type => ({ label: capitalize(type), value: type }));
  const { queryText, symbol, queryType } = { ...defaultQuery, ...query };

  return (
    <div className="gf-form">
      <>
        <FormLabel>Data type</FormLabel>
        <Segment onChange={onTypeChange} options={dataTypes} value={queryType} />
      </>
      <FormField width={4} value={symbol || ''} onChange={onConstantChange} onKeyDown={onKeyDown} label="Symbol" />
      <FormField labelWidth={8} value={queryText || ''} onChange={onQueryTextChange} label="Query Text" tooltip="Not used yet" />
    </div>
  );
};
