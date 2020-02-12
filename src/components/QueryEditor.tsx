import React, { FC, ChangeEvent } from 'react';
import { FormField, FormLabel, Segment } from '@grafana/ui';
import { ExploreQueryFieldProps } from '@grafana/data';
import { DataSource } from '../DataSource';
import { MyQuery, MyDataSourceOptions } from '../types';

type Props = ExploreQueryFieldProps<DataSource, MyQuery, MyDataSourceOptions>;

export const QueryEditor: FC<Props> = ({ onChange, query }) => {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, symbol: event.target.value });
  };

  const onTypeChange = (value: string) => {
    //onChange({ ...query, namespace: value });
  };

  const dataTypes = ['profile', 'quote', 'exchange'].map(type => ({ label: type.toUpperCase(), value: type }));
  const { queryText, symbol } = query;

  return (
    <div className="gf-form">
      <>
        <FormLabel>Data type</FormLabel>
        <Segment onChange={onTypeChange} options={dataTypes} value="profile" />
      </>
      <FormField width={4} value={symbol || ''} onChange={onConstantChange} label="Symbol" />
      <FormField labelWidth={8} value={queryText || ''} onChange={onQueryTextChange} label="Query Text" tooltip="Not used yet" />
    </div>
  );
};
