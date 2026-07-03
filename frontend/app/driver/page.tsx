'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { apiService, TripItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function DriverDashboardPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const current = trips.find((trip) => ['assigned', 'scheduled', 'boarding', 'active', 'in_progress', 'delayed', 'paused', 'emergency'].includes(trip.status));

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    setTrips((await apiService.listTrips(token, { limit: 20 })).items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load driver trips'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const act = async (action: string) => {
    if (!current) return;
    const token = await getToken();
    if (!token) return;
    await apiService.tripAction(token, current._id, { action });
    toast.success('Trip updated');
    await load();
  };

  const sendLocation = async () => {
    if (!current) return;
    const token = await getToken();
    if (!token) return;
    const fallback = { latitude: 17.385, longitude: 78.4867, speed: 0, heading: 0, deviceInfo: 'manual-driver-dashboard' };
    await apiService.updateTripLocation(token, current._id, fallback);
    toast.success('Location heartbeat sent');
    await load();
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Driver App</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Driver Mobile Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Today&apos;s schedule, live trip actions, incidents, leave, announcements, maintenance checklist, and offline sync.</p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-950">Current Trip</h2>
        {current ? (
          <div className="mt-3">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{current.tripCode}</p><p className="text-sm text-zinc-500">{current.plannedDeparture} - {current.plannedArrival}</p></div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{current.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['start', 'pause', 'resume', 'complete', 'delay', 'breakdown', 'accident', 'skip_stop'].map((action) => (
                <button key={action} type="button" onClick={() => void act(action)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50">{action.replace('_', ' ')}</button>
              ))}
              <button type="button" onClick={() => void sendLocation()} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50">Send heartbeat</button>
              <Link href={`/track/${current._id}`} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50">Track map</Link>
            </div>
          </div>
        ) : <p className="mt-3 rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No active trip assigned.</p>}
      </section>

      <section className="grid gap-2">
        {trips.map((trip) => <article key={trip._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="font-medium">{trip.tripCode}</p><p className="text-sm text-zinc-500">{trip.status} · {new Date(trip.serviceDate).toLocaleDateString()}</p></article>)}
      </section>
    </PageShell>
  );
}
