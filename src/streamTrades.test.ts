import { DataQueryResponse, LoadingState } from '@grafana/data';
import { streamTrades } from './streamTrades';

class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  sent: string[] = [];
  close = jest.fn();
  onopen?: () => void;
  onmessage?: (event: MessageEvent<string>) => void;

  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  receive(message: unknown) {
    // Only `data` is read from the event.
    this.onmessage?.({ data: JSON.stringify(message) } as MessageEvent<string>);
  }
}

const realWebSocket = globalThis.WebSocket;

beforeAll(() => {
  // The stream only uses the constructor, send/close, readyState and the on* handlers.
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
});

afterAll(() => {
  globalThis.WebSocket = realWebSocket;
});

beforeEach(() => {
  FakeWebSocket.instances = [];
});

describe('streamTrades', () => {
  it('subscribes on open and appends every trade of a message to one keyed frame', () => {
    const packets: DataQueryResponse[] = [];
    const subscription = streamTrades('ws://grafana/proxy/ws', 'AAPL', 'A').subscribe((packet) =>
      packets.push(packet)
    );
    const socket = FakeWebSocket.instances[0];

    socket.open();
    socket.receive({ type: 'ping' });
    socket.receive({
      type: 'trade',
      data: [
        { p: 150.1, t: 1000 },
        { p: 150.2, t: 2000 },
      ],
    });

    expect(socket.url).toBe('ws://grafana/proxy/ws');
    expect(socket.sent).toEqual([JSON.stringify({ type: 'subscribe', symbol: 'AAPL' })]);
    expect(packets).toHaveLength(1);
    expect(packets[0].key).toBe('A');
    expect(packets[0].state).toBe(LoadingState.Streaming);
    expect(packets[0].data[0].refId).toBe('A');
    expect(Array.from(packets[0].data[0].fields[1].values)).toEqual([150.1, 150.2]);

    subscription.unsubscribe();

    expect(socket.sent[1]).toBe(JSON.stringify({ type: 'unsubscribe', symbol: 'AAPL' }));
    expect(socket.close).toHaveBeenCalled();
  });

  it('closes without sending when unsubscribed before the socket opens', () => {
    const subscription = streamTrades('ws://grafana/proxy/ws', 'AAPL', 'A').subscribe();
    const socket = FakeWebSocket.instances[0];

    subscription.unsubscribe();

    expect(socket.sent).toEqual([]);
    expect(socket.close).toHaveBeenCalled();
  });
});
