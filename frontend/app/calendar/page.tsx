'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { apiService, CalendarEvent } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function CalendarPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getCalendar(token);
      setEvents(data.events);
    };
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load calendar'));
  }, [getToken, isLoaded, ready]);

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Operations / Calendar</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Operations Calendar</h1>
        <p className="mt-1 text-sm text-zinc-600">Trips, schedules, maintenance, leave, and incidents in one operational timeline.</p>
      </section>
      <section className="grid gap-2">
        {events.map((event) => (
          <article key={`${event.type}-${event._id}`} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-950">{event.title}</h2>
                <p className="text-sm text-zinc-500">{event.type} · {event.date ? new Date(event.date).toLocaleDateString() : 'No date'}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{event.status}</span>
            </div>
          </article>
        ))}
        {!events.length ? <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-500">No calendar events in the selected window.</p> : null}
      </section>
    </PageShell>
  );
}
