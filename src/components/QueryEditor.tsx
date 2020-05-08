import React, { ChangeEvent, FC } from 'react';
import capitalize from 'lodash.capitalize';
import { Form, Field, Input, Select } from '@grafana/ui';
import { ExploreQueryFieldProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from '../types';
import { stockMetrics, TABLE_QUERY_TYPES, TIMESERIES_QUERY_TYPES } from '../constants';
import { getTargetType } from '../utils';

type Props = ExploreQueryFieldProps<DataSource, MyQuery, MyDataSourceOptions>;

const queryTypes = [...TIMESERIES_QUERY_TYPES, ...TABLE_QUERY_TYPES];
const metricOptions = stockMetrics.map(metric => ({ value: metric, label: metric }));

export const QueryEditor: FC<Props> = ({ onChange, onRunQuery, query }) => {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const queryType = value.split('?')[0];
    onChange({
      ...query,
      queryText: value,
      format: getTargetType({ value: queryType }),
    });
  };

  const onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onChange({ ...query, [name]: value });
  };

  const onTypeChange = (item: SelectableValue) => {
    onChange({ ...query, type: item });
    if (item.value === 'exchange') {
      onRunQuery();
    }
  };

  const onMetricChange = (item: SelectableValue) => {
    onChange({ ...query, metric: item });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onRunQuery();
    }
  };

  const dataTypes = queryTypes.map(type => ({
    label: capitalize(type),
    value: type,
  }));

  const { queryText, symbol, type, resolution, metric } = { ...defaultQuery, ...query };

  return (
    <Form onSubmit={onRunQuery}>
      {({ register, errors }) => {
        return (
          <>
            <Field label="Query Text" horizontal={false}>
              <Input
                name="customQuery"
                ref={register}
                value={queryText || ''}
                onChange={onQueryTextChange}
                onKeyDown={onKeyDown}
                placeholder="Custom query e.g. 'earnings?symbol=AAPL'"
              />
            </Field>
            <Field label="Data type">
              <Select
                data-testid="Data type"
                onChange={onTypeChange}
                options={dataTypes}
                value={type}
                defaultValue={type}
              />
            </Field>
            {type.value !== 'exchange' && (
              <Field label="Symbol">
                <Input
                  name="symbol"
                  ref={register}
                  value={symbol}
                  onChange={onValueChange}
                  onKeyDown={onKeyDown}
                  placeholder="Stock symbol"
                />
              </Field>
            )}

            {type.value === 'candle' && (
              <Field label="Resolution">
                <Input
                  name="resolution"
                  placeholder="Available values: 1, 5, 15, 30, 60, D, W, M"
                  ref={register}
                  value={resolution}
                  onChange={onValueChange}
                />
              </Field>
            )}

            {type.value === 'metric' && (
              <Field label="Metric">
                <Select onChange={onMetricChange} options={metricOptions} value={metric} defaultValue={metric} />
              </Field>
            )}
          </>
        );
      }}
    </Form>
  );
};
