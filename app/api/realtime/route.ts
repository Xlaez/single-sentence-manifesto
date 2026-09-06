import { broadcaster } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection greeting
      controller.enqueue(encoder.encode(`event: connected\ndata: {"ok":true}\n\n`));

      // Subscribe to real-time events
      unsubscribe = broadcaster.subscribe((eventData) => {
        try {
          controller.enqueue(encoder.encode(eventData));
        } catch {
          // Closed
        }
      });

      // Send periodic heartbeat every 20s to prevent reverse proxy timeouts
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // Closed
        }
      }, 20000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
