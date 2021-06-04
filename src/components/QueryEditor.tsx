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
const metricOptions = stockMetrics.map((metric) => ({ value: metric, label: metric }));

const resolutions = [
  { value: '1', label: '1' },
  { value: '5', label: '5' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
  { value: 'D', label: 'Day' },
  { value: 'W', label: 'Week' },
  { value: 'M', label: 'Month' },
];

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

  const onResolutionChange = (resolution: SelectableValue) => {
    onChange({ ...query, resolution: resolution.value });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onRunQuery();
    }
  };

  const dataTypes = queryTypes.map((type) => ({
    label: capitalize(type).replace(/\d+/g, ''), // Remove numbers from labels
    value: type,
  }));

  const { queryText, symbol, type, resolution, metric } = { ...defaultQuery, ...query };

  return (
    <Form onSubmit={onRunQuery}>
      {({ register, errors }) => {
        return (
          <>
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
                  {...register('symbol')}
                  value={symbol}
                  onChange={onValueChange}
                  onKeyDown={onKeyDown}
                  placeholder="Stock symbol"
                />
              </Field>
            )}

            {type.value === 'candle' && (
              <Field label="Resolution">
                <Select onChange={onResolutionChange} options={resolutions} value={resolution} />
              </Field>
            )}

            {type.value === 'metric' && (
              <Field label="Metric">
                <Select onChange={onMetricChange} options={metricOptions} value={metric} defaultValue={metric} />
              </Field>
            )}
            {type.value !== 'trades' && (
              <Field
                label="Free Query Text"
                horizontal={false}
                description="Experimental. Will override any selected values above."
              >
                <Input
                  {...register('customQuery')}
                  value={queryText || ''}
                  onChange={onQueryTextChange}
                  onKeyDown={onKeyDown}
                  placeholder="Custom query e.g. 'earnings?symbol=AAPL'"
                />
              </Field>
            )}
          </>
        );
      }}
    </Form>
  );
};
