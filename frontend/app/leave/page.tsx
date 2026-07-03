'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, LeaveRequest } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function LeavePage() {
  const { isLoaded, ready, role, getToken } = useAppRole();
  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [form, setForm] = useState({ profileType: 'driver' as 'driver' | 'conductor', profileId: '', fromDate: '', toDate: '', reason: '' });

  const load = async () => {
    const token = await getToken();
    if (!token) return;
    setItems((await apiService.listLeave(token, { limit: 50 })).items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load leave'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = await getToken();
    if (!token) return;
    await apiService.requestLeave(token, form);
    toast.success('Leave requested');
    setForm({ profileType: 'driver', profileId: '', fromDate: '', toDate: '', reason: '' });
    await load();
  };

  const review = async (id: string, status: 'approved' | 'rejected') => {
    const token = await getToken();
    if (!token) return;
    await apiService.reviewLeave(token, id, { status });
    await load();
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Operations / Availability</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">Leave and Availability</h1>
        <p className="mt-1 text-sm text-zinc-600">Crew leave requests, sickness, unavailable status, and dispatcher approval queue.</p>
      </section>
      <form onSubmit={(event) => void submit(event)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <select value={form.profileType} onChange={(e) => setForm({ ...form, profileType: e.target.value as 'driver' | 'conductor' })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><option value="driver">Driver</option><option value="conductor">Conductor</option></select>
        <input required value={form.profileId} onChange={(e) => setForm({ ...form, profileId: e.target.value })} placeholder="Profile ID" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input required type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input required type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Request Leave</ActionButton>
      </form>
      <section className="grid gap-2">
        {items.map((item) => (
          <article key={item._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-zinc-950">{item.reason}</h2><p className="text-sm text-zinc-500">{item.profileType} · {new Date(item.fromDate).toLocaleDateString()} to {new Date(item.toDate).toLocaleDateString()}</p></div>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{item.status}</span>
            </div>
            {role && ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'fleet_manager', 'dispatcher'].includes(role) && item.status === 'pending' ? (
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => void review(item._id, 'approved')} className="rounded-full border border-emerald-200 px-3 py-1 text-xs text-emerald-700">Approve</button>
                <button type="button" onClick={() => void review(item._id, 'rejected')} className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-700">Reject</button>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </PageShell>
  );
}
