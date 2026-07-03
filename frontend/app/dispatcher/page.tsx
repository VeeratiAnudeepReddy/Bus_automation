'use client';

import Link from 'next/link';
import { AlertTriangle, Bus, CalendarClock, UserCheck, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { apiService, DispatcherDashboard } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function DispatcherDashboardPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [data, setData] = useState<DispatcherDashboard | null>(null);

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    setData(await apiService.getDispatcherDashboard(token));
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load dispatcher console'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const stats: [string, number, LucideIcon][] = [
    ['Running', data?.stats.runningTrips ?? 0, CalendarClock],
    ['Upcoming', data?.stats.upcomingDepartures ?? 0, CalendarClock],
    ['Active buses', data?.stats.activeBuses ?? 0, Bus],
    ['Drivers ready', data?.stats.driverAvailability ?? 0, UserCheck],
    ['Conductors ready', data?.stats.conductorAvailability ?? 0, UserCheck],
    ['Incidents', data?.stats.incidents ?? 0, AlertTriangle]
  ];

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Operations / Dispatch</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Dispatcher Control Center</h1>
        <p className="mt-1 text-sm text-zinc-600">Live trip control, vehicle assignment visibility, delay handling, leave queue, and incidents.</p>
      </section>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {stats.map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <Icon size={18} className="text-zinc-500" />
            <p className="mt-2 text-xs text-zinc-500">{String(label)}</p>
            <p className="text-lg font-semibold text-zinc-950">{String(value)}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-950">Control Actions</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ['/trips', 'Manage Trips'],
            ['/schedules', 'Schedules'],
            ['/incidents', 'Incidents'],
            ['/leave', 'Leave Queue'],
            ['/buses', 'Replacement Buses'],
            ['/drivers', 'Drivers'],
            ['/conductors', 'Conductors'],
            ['/calendar', 'Calendar']
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50">{label}</Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-950">Today&apos;s Trips</h2>
          <div className="mt-3 grid gap-2">
            {data?.trips.length ? data.trips.map((trip) => (
              <div key={trip._id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{trip.tripCode}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{trip.status}</span>
                </div>
                <p className="mt-1 text-zinc-600">{trip.plannedDeparture} - {trip.plannedArrival} · Delay {trip.delayMinutes} min</p>
              </div>
            )) : <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No trips created for today. Create one from a schedule.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-950">Open Incidents</h2>
          <div className="mt-3 grid gap-2">
            {data?.incidents.length ? data.incidents.map((incident) => (
              <div key={incident._id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="font-medium">{incident.title}</div>
                <p>{incident.severity} · {incident.status}</p>
              </div>
            )) : <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No active incidents.</p>}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
