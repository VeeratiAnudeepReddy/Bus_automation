'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export type RealtimeEvent<T = unknown> = {
  type: string;
  payload: T;
  timestamp: string;
};

type LocationPayload = {
  trip?: { _id?: string; tripCode?: string; busId?: string };
  location?: {
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    recordedAt?: string;
  };
};

/**
 * Subscribe to org-scoped SSE (`GET /api/realtime/events`).
 * Uses fetch+ReadableStream because EventSource cannot send Authorization headers.
 */
export function subscribeRealtime(options: {
  token: string;
  onEvent: (event: RealtimeEvent) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}): { close: () => void } {
  const controller = new AbortController();
  const signal = options.signal || controller.signal;

  const run = async () => {
    const response = await fetch(`${API_BASE_URL}/realtime/events`, {
      headers: {
        Authorization: `Bearer ${options.token}`,
        Accept: 'text/event-stream'
      },
      signal
    });
    if (!response.ok || !response.body) {
      throw new Error(`Realtime stream failed (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';
      for (const chunk of chunks) {
        const lines = chunk.split('\n');
        let eventType = 'message';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event:')) eventType = line.slice(6).trim();
          if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as RealtimeEvent;
          options.onEvent({ ...parsed, type: parsed.type || eventType });
        } catch {
          options.onEvent({ type: eventType, payload: data, timestamp: new Date().toISOString() });
        }
      }
    }
  };

  void run().catch((error: Error) => {
    if (signal.aborted) return;
    options.onError?.(error);
  });

  return {
    close: () => {
      controller.abort();
    }
  };
}

export function isLocationUpdateForTrip(event: RealtimeEvent, tripId: string): event is RealtimeEvent<LocationPayload> {
  if (event.type !== 'location_updated') return false;
  const payload = event.payload as LocationPayload;
  const id = payload?.trip?._id || (payload as { tripId?: string })?.tripId;
  return String(id) === String(tripId);
}
