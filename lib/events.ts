// Server-Sent Events (SSE) Pub/Sub Broadcaster
// Enables zero-dependency live updates across all connected browsers

type Listener = (data: string) => void;

class RealtimeBroadcaster {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  broadcast(event: string, payload: unknown) {
    const formatted = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    this.listeners.forEach((listener) => {
      try {
        listener(formatted);
      } catch {
        // Listener might have closed connection
      }
    });
  }

  get activeConnectionsCount(): number {
    return this.listeners.size;
  }
}

// Global singleton to persist across HMR during local development
const globalForBroadcaster = globalThis as unknown as {
  manifestoBroadcaster?: RealtimeBroadcaster;
};

export const broadcaster =
  globalForBroadcaster.manifestoBroadcaster ?? new RealtimeBroadcaster();

if (process.env.NODE_ENV !== 'production') {
  globalForBroadcaster.manifestoBroadcaster = broadcaster;
}
