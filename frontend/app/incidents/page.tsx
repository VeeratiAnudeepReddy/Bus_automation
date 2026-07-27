'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, IncidentItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function IncidentsPage() {
  const { isLoaded, ready, getToken } = useAppRole();
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [form, setForm] = useState({ type: 'breakdown' as IncidentItem['type'], severity: 'medium' as IncidentItem['severity'], title: '', description: '' });

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    setIncidents((await apiService.listIncidents(token, { limit: 40 })).items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load incidents'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = await getToken();
    if (!token) return;
    await apiService.createIncident(token, form);
    toast.success('Incident reported');
    setForm({ type: 'breakdown', severity: 'medium', title: '', description: '' });
    await load();
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Operations / Incidents</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Incident Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Drivers and conductors can report breakdowns, traffic, accidents, medical emergencies, passenger issues, and vehicle issues.</p>
      </section>
      <form onSubmit={(event) => void submit(event)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IncidentItem['type'] })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          {['breakdown', 'traffic', 'accident', 'medical', 'passenger', 'vehicle', 'other'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentItem['severity'] })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          {['low', 'medium', 'high', 'critical'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Incident title" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Report Incident</ActionButton>
      </form>
      <section className="grid gap-2">
        {incidents.map((incident) => (
          <article key={incident._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-zinc-950">{incident.title}</h2><p className="text-sm text-zinc-500">{incident.type} · {incident.severity}</p></div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{incident.status}</span>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
