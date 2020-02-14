import React, { ChangeEvent, FC } from 'react';
import capitalize from 'lodash.capitalize';
import { FormField, FormLabel, Segment } from '@grafana/ui';
import { ExploreQueryFieldProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from '../types';
import { TABLE_QUERY_TYPES, TIMESERIES_QUERY_TYPES } from '../constants';
import { getTargetType } from '../utils';

type Props = ExploreQueryFieldProps<DataSource, MyQuery, MyDataSourceOptions>;

const queryTypes = [...TIMESERIES_QUERY_TYPES, ...TABLE_QUERY_TYPES];

export const QueryEditor: FC<Props> = ({ onChange, onRunQuery, query }) => {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const queryType = value.split('?')[0];
    console.log('qq', queryType);
    onChange({ ...query, queryText: value, type: getTargetType({ value: queryType }) });
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
      <FormField
        labelWidth={8}
        value={queryText || ''}
        onChange={onQueryTextChange}
        onKeyDown={onKeyDown}
        label="Query Text"
        tooltip="Custom query e.g. 'earnings?symbol=AAPL'"
      />
    </div>
  );
};
