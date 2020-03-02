import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './DataSource';
import { ConfigEditor, QueryEditor } from './components';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<
  DataSource,
  MyQuery,
  MyDataSourceOptions
>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setExploreQueryField(QueryEditor);
