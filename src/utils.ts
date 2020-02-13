import { SelectableValue } from '@grafana/data';
import { TargetType } from './types';
import { TIMESERIES_QUERY_TYPES } from './constants';

export const getTargetType = (item: SelectableValue = {}): TargetType => {
  if (TIMESERIES_QUERY_TYPES.includes(item.value)) {
    return TargetType.Timeseries;
  }
  return TargetType.Table;
};
