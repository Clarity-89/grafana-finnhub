import React, { ChangeEvent, FC } from 'react';
import capitalize from 'lodash.capitalize';
import { Forms } from '@grafana/ui';
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
    onChange({ ...query, queryText: value, type: getTargetType({ value: queryType }) });
  };

  const onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onChange({ ...query, [name]: value });
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
    <Forms.Form onSubmit={onRunQuery}>
      {({ register, errors }) => {
        return (
          <>
            <Forms.Field label="Query Text" horizontal={false}>
              <Forms.Input
                size="lg"
                name="customQuery"
                ref={register}
                value={queryText || ''}
                onChange={onQueryTextChange}
                onKeyDown={onKeyDown}
                placeholder="Custom query e.g. 'earnings?symbol=AAPL'"
              />
            </Forms.Field>
            <Forms.Field label="Data type">
              <Forms.Select size="lg" onChange={onTypeChange} options={dataTypes} value={queryType} defaultValue={queryType} />
            </Forms.Field>
            <Forms.Field label="Symbol">
              <Forms.Input size="lg" name="symbol" ref={register} value={symbol} onChange={onValueChange} onKeyDown={onKeyDown} />
            </Forms.Field>
          </>
        );
      }}
    </Forms.Form>
  );
};
