import { createDataFrame, DataQueryResponse, FieldType, LoadingState } from '@grafana/data';
import { Observable } from 'rxjs';

interface TradeMessage {
  type: string;
  /** Present on `trade` messages; several trades can arrive per message. */
  data: Array<{ p: number; t: number }>;
}

/** Number of most recent trades kept per stream. */
export const TRADE_CAPACITY = 1000;

/** Live trades for `symbol` over Finnhub's websocket, as a rolling frame of the last TRADE_CAPACITY prices. */
export function streamTrades(url: string, symbol: string, refId: string): Observable<DataQueryResponse> {
  return new Observable((subscriber) => {
    const times: number[] = [];
    const prices: number[] = [];

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
          times.push(t);
          prices.push(p);
        }
        const overflow = times.length - TRADE_CAPACITY;
        if (overflow > 0) {
          times.splice(0, overflow);
          prices.splice(0, overflow);
        }
        // Streaming state makes Grafana re-evaluate a `now`-relative range per packet, so live points stay in view.
        subscriber.next({
          data: [
            createDataFrame({
              refId,
              fields: [
                { name: 'ts', type: FieldType.time, values: times.slice() },
                { name: 'value', type: FieldType.number, values: prices.slice() },
              ],
            }),
          ],
          key: refId,
          state: LoadingState.Streaming,
        });
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
