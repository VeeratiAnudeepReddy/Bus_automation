'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import PageShell from '@/components/PageShell';
import { apiService, TripItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

const ACTION_LABELS: Record<string, string> = {
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  complete: 'Complete',
  delay: 'Delay',
  breakdown: 'Breakdown',
  accident: 'Accident',
  skip_stop: 'Skip stop'
};

function readDevicePosition(): Promise<{ latitude: number; longitude: number; speed: number; heading: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not available on this device'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: Number(position.coords.speed || 0),
          heading: Number(position.coords.heading || 0)
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  });
}

export default function DriverDashboardPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const current = trips.find((trip) =>
    ['assigned', 'scheduled', 'boarding', 'active', 'in_progress', 'delayed', 'paused', 'emergency'].includes(trip.status)
  );

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      setTrips((await apiService.listTrips(token, { limit: 20 })).items);
    } catch {
      setLoadError('Failed to load driver trips');
      toast.error('Failed to load driver trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const act = async (action: string) => {
    if (!current || busy) return;
    const token = await getToken();
    if (!token) return;
    setBusy(true);
    try {
      await apiService.tripAction(token, current._id, { action });
      toast.success('Trip updated');
      await load();
    } catch {
      toast.error('Trip action failed');
    } finally {
      setBusy(false);
    }
  };

  const sendLocation = async () => {
    if (!current || busy) return;
    const token = await getToken();
    if (!token) return;
    setBusy(true);
    try {
      const coords = await readDevicePosition();
      await apiService.updateTripLocation(token, current._id, {
        ...coords,
        deviceInfo: 'driver-dashboard-geolocation'
      });
      toast.success('Location heartbeat sent');
      await load();
    } catch {
      toast.error('Could not read GPS — allow location permission and retry');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Driver App</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Driver Mobile Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Today&apos;s schedule, live trip actions, incidents, leave, announcements, maintenance checklist, and offline sync.
        </p>
      </section>

      {loadError ? <ErrorState title={loadError} onRetry={() => void load()} /> : null}
      {loading ? <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">Loading trips…</p> : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-950">Current Trip</h2>
        {current ? (
          <div className="mt-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{current.tripCode}</p>
                <p className="text-sm text-zinc-500">
                  {current.plannedDeparture} - {current.plannedArrival}
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{current.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(ACTION_LABELS).map(([action, label]) => (
                <button
                  key={action}
                  type="button"
                  disabled={busy}
                  aria-label={label}
                  onClick={() => void act(action)}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                disabled={busy}
                aria-label="Send GPS heartbeat"
                onClick={() => void sendLocation()}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
              >
                Send heartbeat
              </button>
              <Link href={`/track/${current._id}`} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50">
                Track map
              </Link>
            </div>
          </div>
        ) : !loading ? (
          <div className="mt-3">
            <EmptyState title="No active trip" description="When a trip is assigned, live actions and GPS heartbeat appear here." />
          </div>
        ) : null}
      </section>

      <section className="grid gap-2">
        {!loading && trips.length === 0 ? (
          <EmptyState title="No trips yet" description="Assigned schedules will show up in this list." actionHref="/schedules" actionLabel="View schedules" />
        ) : null}
        {trips.map((trip) => (
          <article key={trip._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="font-medium">{trip.tripCode}</p>
            <p className="text-sm text-zinc-500">
              {trip.status} · {new Date(trip.serviceDate).toLocaleDateString()}
            </p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
