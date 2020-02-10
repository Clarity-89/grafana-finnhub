import React, { FC, ChangeEvent } from 'react';
import { FormField } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export const ConfigEditor: FC<Props> = ({ options, onOptionsChange, ...props }) => {
  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        apiToken: event.target.value,
      },
    });
  };

  const onResetAPIKey = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

  const { jsonData } = options;

  return (
    <div className="gf-form-group">
      <div className="gf-form-inline">
        <div className="gf-form">
          <FormField
            value={jsonData.apiToken || ''}
            label="API Token"
            placeholder="Token for the Finnhub API"
            labelWidth={6}
            inputWidth={20}
            onReset={onResetAPIKey}
            onChange={onAPIKeyChange}
          />
        </div>
      </div>
    </div>
  );
};
