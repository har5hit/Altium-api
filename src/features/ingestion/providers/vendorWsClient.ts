import { EventEmitter } from 'node:events';

export interface VendorLiveEvent {
  type: 'match_update' | 'match_event';
  payload: Record<string, unknown>;
}

export default class VendorWsClient extends EventEmitter {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly wsUrl: string,
    private readonly apiKey: string
  ) {
    super();
  }

  connect(): void {
    if (!this.wsUrl) return;

    const url = this.apiKey
      ? `${this.wsUrl}${this.wsUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(this.apiKey)}`
      : this.wsUrl;

    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as VendorLiveEvent;
        this.emit('event', parsed);
      } catch {
        // drop malformed frame to keep stream hot
      }
    };

    this.socket.onclose = () => {
      this.reconnectTimer = setTimeout(() => this.connect(), 2000);
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;
  }
}
