import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryEditor } from './QueryEditor';
import { DataSource } from '../DataSource';
import { data } from '../__mocks__/data';

describe('QueryEditor', () => {
  it('should render the editor with default form values', () => {
    const { getByPlaceholderText, getByText } = render(
      <QueryEditor
        history={[]}
        datasource={DataSource as any}
        query={data.targets[0]}
        onRunQuery={jest.fn()}
        onChange={jest.fn()}
      />
    );

    expect(getByPlaceholderText("Custom query e.g. 'earnings?symbol=AAPL'")).toHaveValue('');
    expect(getByPlaceholderText('Stock symbol')).toHaveValue('AAPL');
    expect(getByText('Profile')).toBeInTheDocument();
  });
});
