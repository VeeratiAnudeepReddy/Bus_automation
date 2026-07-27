'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, BusItem, ConductorProfile, DriverProfile, RouteItem, ScheduleItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function SchedulesPage() {
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [conductors, setConductors] = useState<ConductorProfile[]>([]);
  const [form, setForm] = useState({ routeId: '', busId: '', driverId: '', conductorId: '', departureTime: '08:00', arrivalTime: '09:00', tripNumber: '', effectiveFrom: new Date().toISOString().slice(0, 10), days: ['mon', 'tue', 'wed', 'thu', 'fri'] });

  const load = async () => {
    if (!user) return;
    const token = await getToken();
    if (!token) return;
    const [scheduleData, routeData, busData, driverData, conductorData] = await Promise.all([
      apiService.listSchedules(token),
      apiService.getAdminRoutes(token),
      apiService.listBuses(token, { status: 'all', limit: 100 }),
      apiService.listDrivers(token, { status: 'all', limit: 100 }),
      apiService.listConductors(token, { status: 'all', limit: 100 })
    ]);
    setSchedules(scheduleData.items);
    setRoutes(routeData.routes);
    setBuses(busData.items);
    setDrivers(driverData.items);
    setConductors(conductorData.items);
  };
  useEffect(() => {
    if (isLoaded && ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      await apiService.createSchedule(token, { ...form, frequency: 'daily', status: 'scheduled' });
      toast.success('Schedule created');
      await load();
    } catch {
      toast.error('Schedule conflict or invalid assignment');
    }
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold">Scheduling</h1>
        <p className="mt-1 text-sm text-zinc-600">Calendar, weekly trips, assignments, and conflict warnings.</p>
      </section>
      <form onSubmit={(e) => void submit(e)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Create Schedule</h2>
        <select required value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><option value="">Route</option>{routes.map((r) => <option key={r._id} value={r._id}>{r.routeCode || r.from} → {r.to}</option>)}</select>
        <select required value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><option value="">Bus</option>{buses.map((b) => <option key={b._id} value={b._id}>{b.busNumber}</option>)}</select>
        <select required value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><option value="">Driver</option>{drivers.map((d) => <option key={d._id} value={d._id}>{d.licenseNumber}</option>)}</select>
        <select required value={form.conductorId} onChange={(e) => setForm({ ...form, conductorId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><option value="">Conductor</option>{conductors.map((c) => <option key={c._id} value={c._id}>{c.employeeId}</option>)}</select>
        <input required value={form.tripNumber} onChange={(e) => setForm({ ...form, tripNumber: e.target.value.toUpperCase() })} placeholder="Trip number" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-2"><input type="time" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" /><input type="time" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" /></div>
        <input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Create Schedule</ActionButton>
      </form>
      <section className="grid gap-2">
        {schedules.map((schedule) => <article key={schedule._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><h2 className="font-semibold">{schedule.tripNumber}</h2><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{schedule.status}</span></div><p className="mt-2 text-sm text-zinc-600">{schedule.departureTime} - {schedule.arrivalTime} · {schedule.days.join(', ')}</p></article>)}
      </section>
    </PageShell>
  );
}
