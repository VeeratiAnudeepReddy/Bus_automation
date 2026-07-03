'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { apiService, TripItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function ConductorDashboardPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const current = trips.find((trip) => ['assigned', 'scheduled', 'boarding', 'active', 'in_progress', 'delayed', 'paused'].includes(trip.status));

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    setTrips((await apiService.listTrips(token, { limit: 20 })).items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load conductor trips'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const act = async (action: string, occupancy?: number) => {
    if (!current) return;
    const token = await getToken();
    if (!token) return;
    await apiService.tripAction(token, current._id, { action, occupancy });
    toast.success('Trip updated');
    await load();
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Conductor App</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Conductor Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Boarding, passenger count, QR scanner, revenue, incidents, announcements, and trip history.</p>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-950">Current Trip</h2>
        {current ? (
          <div className="mt-3">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{current.tripCode}</p><p className="text-sm text-zinc-500">Passengers {current.occupancy} · Revenue {current.revenue}</p></div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{current.boardingOpen ? 'boarding open' : current.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void act('open_boarding')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Open boarding</button>
              <button type="button" onClick={() => void act('close_boarding')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Close boarding</button>
              <button type="button" onClick={() => void act('overcrowding', current.occupancy + 5)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Overcrowding</button>
              <button type="button" onClick={() => void act('fare_issue')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Fare issue</button>
              <Link href="/admin" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">QR scanner</Link>
              <Link href="/incidents" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Report issue</Link>
            </div>
          </div>
        ) : <p className="mt-3 rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No active conductor trip.</p>}
      </section>
      <section className="grid gap-2">
        {trips.map((trip) => <article key={trip._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="font-medium">{trip.tripCode}</p><p className="text-sm text-zinc-500">{trip.status} · {trip.plannedDeparture}</p></article>)}
      </section>
    </PageShell>
  );
}
