import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryEditor } from './QueryEditor';
import { DataSource } from '../DataSource';
import { legacyQuery } from '../__mocks__/data';
import { MyQuery } from '../types';

// The editor never touches the datasource instance.
const datasource = {} as DataSource;

/** Feeds onChange back into the query prop, as Grafana's query row does. */
const Harness = ({ initial, onChange }: { initial: MyQuery; onChange: jest.Mock }) => {
  const [query, setQuery] = useState(initial);
  return (
    <QueryEditor
      datasource={datasource}
      query={query}
      onRunQuery={jest.fn()}
      onChange={(next) => {
        onChange(next);
        setQuery(next);
      }}
    />
  );
};

describe('QueryEditor', () => {
  it('renders a pre-0.8 query and writes back the current shape on change', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    // Old dashboards hold the legacy shape at runtime; the prop type is the current model.
    render(<Harness initial={legacyQuery as MyQuery} onChange={onChange} />);

    expect(screen.getByLabelText('Data type')).toHaveValue('Profile');
    expect(screen.getByLabelText('Symbol')).toHaveValue('aapl');
    expect(screen.getByLabelText(/Free Query Text/)).toHaveValue('');

    await user.clear(screen.getByLabelText('Symbol'));
    await user.type(screen.getByLabelText('Symbol'), 'MSFT');

    expect(screen.getByLabelText('Symbol')).toHaveValue('MSFT');
    expect(onChange).toHaveBeenLastCalledWith({
      refId: 'A',
      type: 'profile2',
      symbol: 'MSFT',
      resolution: '1',
      metric: 'price',
    });
  });

  it('shows the resolution picker only for candles, with the saved value selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const candle: MyQuery = { refId: 'A', type: 'candle', symbol: 'AAPL', resolution: 'D', metric: 'price' };
    render(<Harness initial={candle} onChange={onChange} />);

    expect(screen.getByLabelText('Data type')).toHaveValue('Candle (Premium)');
    expect(screen.getByLabelText('Resolution')).toHaveValue('Day');

    await user.click(screen.getByLabelText('Data type'));
    await user.click(screen.getByRole('option', { name: 'Quote' }));

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'quote' }));
    expect(screen.getByLabelText('Data type')).toHaveValue('Quote');
    expect(screen.queryByLabelText('Resolution')).toBeNull();
  });
});
