'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, ScheduleItem, TripItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function TripsPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [form, setForm] = useState({ scheduleId: '', serviceDate: new Date().toISOString().slice(0, 10), tripCode: '' });

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    const [tripData, scheduleData] = await Promise.all([apiService.listTrips(token, { limit: 50 }), apiService.listSchedules(token, { limit: 100 })]);
    setTrips(tripData.items);
    setSchedules(scheduleData.items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load trips'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = await getToken();
    if (!token) return;
    await apiService.createTrip(token, form);
    toast.success('Trip created');
    setForm({ scheduleId: '', serviceDate: new Date().toISOString().slice(0, 10), tripCode: '' });
    await load();
  };

  const updateStatus = async (trip: TripItem, status: TripItem['status']) => {
    const token = await getToken();
    if (!token) return;
    await apiService.updateTripStatus(token, trip._id, { status });
    await load();
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Operations / Trips</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Trip Execution</h1>
        <p className="mt-1 text-sm text-zinc-600">Create daily trips from schedules and move them through scheduled, preparing, boarding, in progress, completed, or cancelled.</p>
      </section>

      <form onSubmit={(event) => void submit(event)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <select required value={form.scheduleId} onChange={(e) => setForm({ ...form, scheduleId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          <option value="">Choose schedule</option>
          {schedules.map((schedule) => <option key={schedule._id} value={schedule._id}>{schedule.tripNumber} · {schedule.departureTime}</option>)}
        </select>
        <input type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input value={form.tripCode} onChange={(e) => setForm({ ...form, tripCode: e.target.value.toUpperCase() })} placeholder="Optional trip code" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Create Trip</ActionButton>
      </form>

      <section className="grid gap-2">
        {trips.map((trip) => (
          <article key={trip._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-950">{trip.tripCode}</h2>
                <p className="text-sm text-zinc-500">{new Date(trip.serviceDate).toLocaleDateString()} · {trip.plannedDeparture} - {trip.plannedArrival}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{trip.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['preparing', 'boarding', 'in_progress', 'completed', 'cancelled'] as TripItem['status'][]).map((status) => (
                <button key={status} type="button" onClick={() => void updateStatus(trip, status)} className="rounded-full border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50">{status}</button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
