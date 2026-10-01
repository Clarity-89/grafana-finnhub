import { CircularDataFrame, DataQueryResponse, FieldType, LoadingState } from '@grafana/data';
import { Observable } from 'rxjs';

interface TradeMessage {
  type: string;
  /** Present on `trade` messages; several trades can arrive per message. */
  data: Array<{ p: number; t: number }>;
}

/** Live trades for `symbol` over Finnhub's websocket, as a rolling frame of the last 1000 prices. */
export function streamTrades(url: string, symbol: string, refId: string): Observable<DataQueryResponse> {
  return new Observable((subscriber) => {
    const frame = new CircularDataFrame({ append: 'tail', capacity: 1000 });
    frame.refId = refId;
    frame.addField({ name: 'ts', type: FieldType.time });
    frame.addField({ name: 'value', type: FieldType.number });

    const socket = new WebSocket(url);
    socket.onopen = () => socket.send(JSON.stringify({ type: 'subscribe', symbol }));
    socket.onerror = () => subscriber.error(new Error('WebSocket error'));
    socket.onclose = () => subscriber.complete();
    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const message: TradeMessage = JSON.parse(event.data);
        if (message.type !== 'trade') {
          return;
        }
        for (const { t, p } of message.data) {
          frame.add({ ts: t, value: p });
        }
        // Streaming state makes Grafana re-evaluate a `now`-relative range per packet, so live points stay in view.
        subscriber.next({ data: [frame], key: refId, state: LoadingState.Streaming });
      } catch (e) {
        subscriber.error(e);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      }
      socket.close();
    };
  });
}
