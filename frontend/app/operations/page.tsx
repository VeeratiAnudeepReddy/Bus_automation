'use client';

import Link from 'next/link';
import { AlertTriangle, Bus, CalendarClock, Map, Route, Users, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { RouteMap } from '@/components/maps/MapView';
import { apiService, OperationsDashboard } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

type IconCard = [string, number, LucideIcon];
type NavCard = [string, string, LucideIcon];

export default function OperationsPage() {
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [data, setData] = useState<OperationsDashboard | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !ready || !user) return;
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing Clerk token');
        setData(await apiService.getOperationsDashboard(token));
      } catch {
        toast.error('Failed to load operations');
      }
    };
    void load();
  }, [getToken, isLoaded, ready, user]);

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Operations Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Fleet health, assignments, trips, alerts, and route map preview.</p>
      </section>

      <section className="grid grid-cols-2 gap-2">
        {([
          ['Fleet', data?.stats.buses ?? 0, Bus],
          ['Active Buses', data?.stats.activeBuses ?? 0, Bus],
          ['Drivers On Duty', data?.stats.driversOnDuty ?? 0, Users],
          ['Conductors On Duty', data?.stats.conductorsOnDuty ?? 0, Users],
          ["Today's Trips", data?.stats.trips ?? 0, CalendarClock],
          ['Maintenance', data?.stats.maintenance ?? 0, AlertTriangle]
        ] as IconCard[]).map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <Icon size={18} className="text-zinc-500" />
            <p className="mt-2 text-xs text-zinc-500">{String(label)}</p>
            <p className="text-lg font-semibold text-zinc-900">{String(value)}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Quick Actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {([
            ['/buses', 'Buses', Bus],
            ['/drivers', 'Drivers', Users],
            ['/conductors', 'Conductors', Users],
            ['/schedules', 'Schedules', CalendarClock],
            ['/admin/fares', 'Routes', Route]
          ] as NavCard[]).map(([href, label, Icon]) => (
            <Link key={href} href={href} className="rounded-xl border border-zinc-200 p-3 text-sm">
              <Icon size={16} className="mb-2" /> {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 p-4">
          <Map size={18} />
          <h2 className="text-sm font-semibold text-zinc-900">Interactive Route Preview</h2>
        </div>
        <RouteMap className="h-64" />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Alerts</h2>
        <div className="mt-3 grid gap-2">
          {data?.alerts.length ? data.alerts.map((bus) => (
            <div key={bus._id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {bus.busNumber} needs attention: {bus.maintenanceStatus}
            </div>
          )) : <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No fleet alerts.</p>}
        </div>
      </section>
    </PageShell>
  );
}
