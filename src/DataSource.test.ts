import moment from 'moment';
import { DataSource } from './DataSource';
import { PluginType } from '@grafana/data';

const getDs = () =>
  new DataSource(
    {
      type: 'finnhub-datasource',
      id: 1,
      meta: {
        name: 'Finnhub',
        type: PluginType.datasource,
        id: 'finnhub-datasource',
        module: 'plugins/finnhub-datasource/module',
        baseUrl: 'public/plugins/finnhub-datasource',
        info: {
          author: { name: 'Alex Khomenko', url: '' },
          description: 'Finnhub Data Source',
          links: [],
          logos: {
            small: 'public/plugins/finnhub-datasource/img/logo.svg',
            large: 'public/plugins/finnhub-datasource/img/logo.svg',
          },
          build: {},
          screenshots: [],
          version: '1.0.0',
          updated: '2020-03-10',
        },
      },

      name: 'Finnhub',
      jsonData: { apiToken: '123XX' },
    },
    //@ts-ignore
    jest.fn()
  );

describe('DataSource', () => {
  it('should construct query based on params', () => {
    const ds = getDs();
    const range = { to: moment(), from: moment().subtract(1, 'month') };
    expect(ds.constructQuery({ symbol: 'test' }, range)).toEqual({ symbol: 'TEST' });
  });
});
