import React, { FC, ChangeEvent } from 'react';
import { Button, InlineField, InlineFieldRow, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, SecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, SecureJsonData> {}

export const ConfigEditor: FC<Props> = ({ options, onOptionsChange }) => {
  const { secureJsonData, secureJsonFields } = options;
  const configured = !!secureJsonFields?.apiToken;

  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiToken: event.target.value,
      },
    });
  };

  const onTokenReset = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiToken: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiToken: '',
      },
    });
  };

  return (
    <InlineFieldRow>
      <InlineField
        label="API Token"
        disabled={configured}
        labelWidth={20}
        tooltip={
          <>
            Free API token can be created on{' '}
            <a href={'https://finnhub.io/'} about={'blank'} rel={'noreferrer nopenner'}>
              Finnhub website
            </a>
          </>
        }
      >
        <Input
          width={39.5} // Match the width of the "name" field
          type={'password'}
          value={secureJsonData?.apiToken || ''}
          placeholder={configured ? 'Configured' : 'Token for the Finnhub API'}
          onChange={onAPIKeyChange}
        />
      </InlineField>
      {configured && (
        <Button variant={'secondary'} onClick={onTokenReset}>
          Reset
        </Button>
      )}
    </InlineFieldRow>
  );
};
