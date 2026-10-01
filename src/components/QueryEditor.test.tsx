import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryEditor } from './QueryEditor';
import { DataSource } from '../DataSource';
import { legacyQuery } from '../__mocks__/data';
import { MyQuery } from '../types';

// The scaffold's react-inlinesvg mock keeps only `src`; the clear button lives on the icon's role, title and onClick.
jest.mock('react-inlinesvg', () => {
  const React = jest.requireActual('react');
  return function InlineSVG({ src, title, innerRef, loader, ...rest }: Record<string, unknown>) {
    return React.createElement(
      'svg',
      { ...rest, ref: innerRef },
      title ? React.createElement('title', null, title) : null
    );
  };
});

const searchSymbols = jest.fn(async (text: string) =>
  text ? [{ symbol: 'AAPL', displaySymbol: 'AAPL', description: 'APPLE INC' }] : []
);
// The editor only calls searchSymbols.
const datasource = { searchSymbols } as unknown as DataSource;

const current: MyQuery = {
  refId: 'A',
  type: 'profile2',
  symbol: 'AAPL',
  search: '',
  resolution: '1',
  metric: 'price',
  exchange: 'US',
  category: 'general',
};

/** Feeds onChange back into the query prop, as Grafana's query row does. */
const Harness = ({
  initial,
  onChange,
  onRunQuery = jest.fn(),
}: {
  initial: MyQuery;
  onChange: jest.Mock;
  onRunQuery?: jest.Mock;
}) => {
  const [query, setQuery] = useState(initial);
  return (
    <QueryEditor
      datasource={datasource}
      query={query}
      onRunQuery={onRunQuery}
      onChange={(next) => {
        onChange(next);
        setQuery(next);
      }}
    />
  );
};

/** The Field renders the type description inside the label, so match on the leading text. */
const typeInput = () => screen.getByLabelText(/^Data type/);

/** The menu is virtualized and jsdom cannot scroll, so narrow it by typing first. */
const pickType = async (user: UserEvent, label: string) => {
  await user.click(typeInput());
  await user.keyboard(label);
  await user.click(screen.getByRole('option', { name: label }));
};

describe('QueryEditor', () => {
  beforeEach(() => searchSymbols.mockClear());

  it('renders a pre-1.0 query and writes back the current shape when a symbol is picked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    // Old dashboards hold the legacy shape at runtime; the prop type is the current model.
    render(<Harness initial={legacyQuery as MyQuery} onChange={onChange} onRunQuery={onRunQuery} />);

    expect(typeInput()).toHaveValue('Profile');
    expect(screen.getByLabelText('Symbol')).toHaveValue('aapl');
    expect(screen.getByLabelText(/Free Query Text/)).toHaveValue('');

    await user.type(screen.getByLabelText('Symbol'), 'app');
    await user.click(await screen.findByRole('option', { name: /APPLE INC/ }));

    expect(searchSymbols).toHaveBeenCalledWith('app');
    expect(onChange).toHaveBeenLastCalledWith({ ...current, symbol: 'AAPL' });
    expect(onRunQuery).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Symbol')).toHaveValue('AAPL');
  });

  it('accepts a template variable as a custom symbol', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Harness initial={current} onChange={onChange} />);

    await user.type(screen.getByLabelText('Symbol'), '$symbol{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({ ...current, symbol: '$symbol' });
  });

  it('clears the symbol', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Harness initial={current} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear value' }));

    expect(onChange).toHaveBeenLastCalledWith({ ...current, symbol: '' });
    expect(screen.queryByRole('button', { name: 'Clear value' })).toBeNull();
  });

  it('shows the lookup failure and still commits the typed symbol', async () => {
    searchSymbols.mockRejectedValue(new Error('429'));
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Harness initial={current} onChange={onChange} />);

    await user.type(screen.getByLabelText('Symbol'), 'zz');
    expect(await screen.findByText('An error occurred while loading options.')).toBeInTheDocument();

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({ ...current, symbol: 'zz' });
  });

  it('shows the inputs of the chosen type and runs the query only once they are filled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<Harness initial={current} onChange={onChange} onRunQuery={onRunQuery} />);

    await pickType(user, 'Market news');
    expect(screen.getByLabelText('Category')).toHaveValue('general');
    expect(screen.queryByLabelText('Symbol')).toBeNull();
    expect(screen.getByText('Latest headlines; ignores the dashboard time range.')).toBeInTheDocument();
    expect(onRunQuery).toHaveBeenCalledTimes(1);

    await pickType(user, 'Market status');
    expect(screen.getByLabelText('Exchange')).toHaveValue('US');
    expect(onRunQuery).toHaveBeenCalledTimes(2);

    // The search term is still empty, so the switch waits for it.
    await pickType(user, 'Symbol lookup');
    expect(screen.getByLabelText('Search')).toHaveValue('');
    expect(screen.queryByLabelText('Symbol')).toBeNull();
    expect(onRunQuery).toHaveBeenCalledTimes(2);

    await user.type(screen.getByLabelText('Search'), 'apple{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'symbol-lookup', symbol: 'AAPL', search: 'apple' })
    );
    expect(onRunQuery).toHaveBeenCalledTimes(3);

    await user.click(screen.getByRole('button', { name: 'Run query' }));
    expect(onRunQuery).toHaveBeenCalledTimes(4);
  });

  it('shows the resolution picker only for candles and runs the query when the type changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(
      <Harness initial={{ ...current, type: 'candle', resolution: 'D' }} onChange={onChange} onRunQuery={onRunQuery} />
    );

    expect(typeInput()).toHaveValue('Candle');
    expect(screen.getByLabelText('Resolution')).toHaveValue('Day');

    await pickType(user, 'Quote');

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'quote' }));
    expect(onRunQuery).toHaveBeenCalledTimes(1);
    expect(typeInput()).toHaveValue('Quote');
    expect(screen.queryByLabelText('Resolution')).toBeNull();
  });
});
