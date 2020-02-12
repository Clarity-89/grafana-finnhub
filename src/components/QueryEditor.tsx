import React, { PureComponent, ChangeEvent } from 'react';
import { FormField } from '@grafana/ui';
import { ExploreQueryFieldProps } from '@grafana/data';
import { DataSource } from '../DataSource';
import { MyQuery, MyDataSourceOptions } from '../types';

type Props = ExploreQueryFieldProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, symbol: event.target.value });
  };

  render() {
    const { queryText, symbol } = this.props.query;

    return (
      <div className="gf-form">
        <FormField width={4} value={symbol || ''} onChange={this.onConstantChange} label="Symbol" />
        <FormField labelWidth={8} value={queryText || ''} onChange={this.onQueryTextChange} label="Query Text" tooltip="Not used yet" />
      </div>
    );
  }
}
