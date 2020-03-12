import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryEditor } from './QueryEditor';
import { defaultQuery } from '../types';

describe('QueryEditor', () => {
  it('should render the editor with default form values', () => {
    const { getByPlaceholderText } = render(
      //@ts-ignore
      <QueryEditor query={{}} onRunQuery={jest.fn()} onChange={jest.fn()} />
    );

    expect(getByPlaceholderText("Custom query e.g. 'earnings?symbol=AAPL'")).toHaveValue(defaultQuery.symbol);
  });
});
