'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, BusItem, FuelRecord } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function FuelPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [form, setForm] = useState({ busId: '', litres: 0, pricePerLitre: 0, distanceKm: 0, odometer: 0, vendor: '' });

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    const [fuelData, busData] = await Promise.all([apiService.listFuel(token, { limit: 50 }), apiService.listBuses(token, { status: 'all', limit: 100 })]);
    setRecords(fuelData.items);
    setBuses(busData.items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load fuel'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = await getToken();
    if (!token) return;
    await apiService.createFuel(token, form);
    toast.success('Fuel record saved');
    setForm({ busId: '', litres: 0, pricePerLitre: 0, distanceKm: 0, odometer: 0, vendor: '' });
    await load();
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Fleet / Fuel</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Fuel Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Fuel fill, mileage, vendor, distance, cost, and efficiency reporting.</p>
      </section>
      <form onSubmit={(event) => void submit(event)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <select required value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><option value="">Bus</option>{buses.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber}</option>)}</select>
        <input required type="number" value={form.litres} onChange={(e) => setForm({ ...form, litres: Number(e.target.value) })} placeholder="Litres" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input required type="number" value={form.pricePerLitre} onChange={(e) => setForm({ ...form, pricePerLitre: Number(e.target.value) })} placeholder="Price per litre" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })} placeholder="Distance km" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: Number(e.target.value) })} placeholder="Odometer" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Save Fuel</ActionButton>
      </form>
      <section className="grid gap-2">
        {records.map((record) => (
          <article key={record._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-zinc-950">{record.litres} L · {record.vendor || 'Fuel fill'}</h2>
            <p className="mt-1 text-sm text-zinc-600">Cost {record.totalCost} · Efficiency {(record.efficiencyKmPerLitre || 0).toFixed(2)} km/L</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
