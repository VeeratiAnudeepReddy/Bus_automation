'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, BusItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

const emptyBus = { busNumber: '', registrationNumber: '', capacity: 40, vehicleType: 'standard', category: 'ordinary', fuelType: 'diesel' };

export default function BusesPage() {
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [form, setForm] = useState(emptyBus);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const token = await getToken();
    if (!token) return;
    const data = await apiService.listBuses(token, { search, status });
    setBuses(data.items);
  };
  useEffect(() => {
    if (isLoaded && ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready, search, status]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      await apiService.createBus(token, form);
      setForm(emptyBus);
      toast.success('Bus created');
      await load();
    } catch {
      toast.error('Failed to create bus');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    const token = await getToken();
    if (!token) return;
    const csv = await apiService.exportBuses(token);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Bus Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Fleet dashboard, maintenance alerts, documents, capacity, amenities, import and export.</p>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bus or registration" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            <option value="all">All statuses</option><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="assigned">Assigned</option><option value="retired">Retired</option>
          </select>
          <ActionButton onClick={() => void exportCsv()}>Export CSV</ActionButton>
        </div>
      </section>
      <form onSubmit={(e) => void submit(e)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Create Bus</h2>
        <input required value={form.busNumber} onChange={(e) => setForm({ ...form, busNumber: e.target.value.toUpperCase() })} placeholder="Bus number" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input required value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })} placeholder="Registration number" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input required type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} placeholder="Capacity" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Bus'}</ActionButton>
      </form>
      <section className="grid gap-2">
        {buses.map((bus) => (
          <article key={bus._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold">{bus.busNumber}</h2><p className="text-sm text-zinc-500">{bus.registrationNumber}</p></div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{bus.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <span>Capacity: {bus.capacity}</span><span>Fuel: {bus.fuelType}</span><span>Maintenance: {bus.maintenanceStatus}</span><span>Next service: {bus.nextServiceDate ? new Date(bus.nextServiceDate).toLocaleDateString() : 'Not set'}</span>
            </div>
          </article>
        ))}
        {!buses.length ? <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-500">No buses found.</p> : null}
      </section>
    </PageShell>
  );
}
