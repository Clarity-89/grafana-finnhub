import React, { FC, ChangeEvent } from 'react';
import { Field, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, SecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, SecureJsonData> {}

export const ConfigEditor: FC<Props> = ({ options, onOptionsChange }) => {
  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiToken: event.target.value,
      },
    });
  };

  const { secureJsonData } = options;

  return (
    <Field label="API Token">
      <Input value={secureJsonData?.apiToken || ''} placeholder="Token for the Finnhub API" onChange={onAPIKeyChange} />
    </Field>
  );
};
