import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryEditor } from './QueryEditor';
import { DataSource } from '../DataSource';
import { defaultQuery } from '../types';

describe('QueryEditor', () => {
  it('should render the editor with default form values', () => {
    const { getByPlaceholderText, getByTestId } = render(
      //@ts-ignore
      <QueryEditor history={[]} datasource={DataSource} query={{}} onRunQuery={jest.fn()} onChange={jest.fn()} />
    );

    expect(getByPlaceholderText("Custom query e.g. 'earnings?symbol=AAPL'")).toHaveValue('');
    expect(getByPlaceholderText('Stock symbol')).toHaveValue(defaultQuery.symbol);
    //expect(getByTestId('Data type')).toHaveValue(defaultQuery.queryType?.value);
  });
});
