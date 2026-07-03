'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, BusItem, MaintenanceRecord } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

type MaintenanceForm = {
  busId: string;
  title: string;
  type: MaintenanceRecord['type'];
  priority: MaintenanceRecord['priority'];
  scheduledFor: string;
  vendor: string;
  cost: number;
};

const emptyMaintenanceForm: MaintenanceForm = { busId: '', title: '', type: 'preventive', priority: 'medium', scheduledFor: '', vendor: '', cost: 0 };

export default function MaintenancePage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [form, setForm] = useState<MaintenanceForm>(emptyMaintenanceForm);

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    const [maintenanceData, busData] = await Promise.all([
      apiService.listMaintenance(token, { limit: 30 }),
      apiService.listBuses(token, { status: 'all', limit: 100 })
    ]);
    setRecords(maintenanceData.items);
    setBuses(busData.items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load maintenance'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = await getToken();
    if (!token) return;
    await apiService.createMaintenance(token, form);
    toast.success('Maintenance record created');
    setForm(emptyMaintenanceForm);
    await load();
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Fleet / Maintenance</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Maintenance Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Preventive service, breakdown repair, document expiry, vendor work, cost tracking, and overdue alerts.</p>
      </section>

      <form onSubmit={(event) => void submit(event)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 text-sm font-semibold text-zinc-950">Create Maintenance Work</h2>
        <select required value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          <option value="">Select bus</option>
          {buses.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber} · {bus.registrationNumber}</option>)}
        </select>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Work title" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceRecord['type'] })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          {(['preventive', 'breakdown', 'tyre', 'battery', 'engine', 'fitness', 'insurance', 'permit', 'pollution', 'other'] as MaintenanceRecord['type'][]).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as MaintenanceRecord['priority'] })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          {(['low', 'medium', 'high', 'critical'] as MaintenanceRecord['priority'][]).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input type="date" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} placeholder="Cost" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Create Work Order</ActionButton>
      </form>

      <section className="grid gap-2">
        {records.map((record) => (
          <article key={record._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-950">{record.title}</h2>
                <p className="text-sm text-zinc-500">{record.type} · {record.vendor || 'Internal'}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{record.status}</span>
            </div>
            <p className="mt-3 text-sm text-zinc-600">Priority {record.priority} · Cost {record.cost || 0} · Scheduled {record.scheduledFor ? new Date(record.scheduledFor).toLocaleDateString() : 'Not scheduled'}</p>
          </article>
        ))}
        {!records.length ? <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-500">No maintenance records. Create preventive work for your first bus.</p> : null}
      </section>
    </PageShell>
  );
}
