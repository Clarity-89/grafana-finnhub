import React, { PureComponent, ChangeEvent } from 'react';
import { FormField } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../DataSource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, symbol: event.target.value });
    onRunQuery(); // executes the query
  };

  render() {
    const query = { ...this.props.query, ...defaultQuery };
    const { queryText, symbol } = query;

    return (
      <div className="gf-form">
        <FormField width={4} value={symbol} onChange={this.onConstantChange} label="Symbol" type="number" step="0.1" />
        <FormField labelWidth={8} value={queryText || ''} onChange={this.onQueryTextChange} label="Query Text" tooltip="Not used yet" />
      </div>
    );
  }
}
