'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import ScannerCard from '@/components/ScannerCard';
import { apiService, BusItem, ConductorProfile, ManagedUser, ScanResult } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function ConductorsPage() {
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [conductors, setConductors] = useState<ConductorProfile[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [form, setForm] = useState({ userId: '', employeeId: '' });
  const [manual, setManual] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const load = async () => {
    if (!user) return;
    const token = await getToken();
    if (!token) return;
    const [profileData, userData, busData] = await Promise.all([
      apiService.listConductors(token),
      apiService.listUsers(token, { role: 'conductor', limit: 50 }),
      apiService.listBuses(token, { status: 'all', limit: 50 })
    ]);
    setConductors(profileData.items);
    setUsers(userData.users);
    setBuses(busData.items);
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
      await apiService.createConductor(token, form);
      toast.success('Conductor profile created');
      setForm({ userId: '', employeeId: '' });
      await load();
    } catch {
      toast.error('Failed to create conductor');
    }
  };

  const validate = async () => {
    if (!manual.trim()) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      setScanResult(await apiService.scanTicket(token, manual.trim()));
    } catch {
      toast.error('Validation failed');
    }
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold">Conductor Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Profiles, assignments, shifts, scanner, attendance, collections, and reports.</p>
      </section>
      <form onSubmit={(e) => void submit(e)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Create Conductor Profile</h2>
        <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          <option value="">Select conductor user</option>{users.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.email}</option>)}
        </select>
        <input required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value.toUpperCase() })} placeholder="Employee ID" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Create Conductor</ActionButton>
      </form>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Manual Ticket Scanner</h2>
        <div className="mt-3 flex gap-2"><input value={manual} onChange={(e) => setManual(e.target.value)} className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Ticket payload or ID" /><ActionButton onClick={() => void validate()}>Scan</ActionButton></div>
      </section>
      {scanResult ? <ScannerCard result={scanResult} /> : null}
      {conductors.map((conductor) => (
        <article key={conductor._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between"><div><h2 className="font-semibold">{conductor.employeeId}</h2><p className="text-sm text-zinc-500">{conductor.shift?.name || 'General'} shift {conductor.shift?.start}-{conductor.shift?.end}</p></div><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{conductor.status}</span></div>
          <p className="mt-2 text-sm text-zinc-600">Tickets validated {conductor.ticketsValidated ?? 0} · Cash {conductor.cashCollected ?? 0}</p>
          <select value={conductor.assignedBus || ''} onChange={async (e) => { const token = await getToken(); if (token) { await apiService.assignConductorBus(token, conductor._id, e.target.value); await load(); } }} className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            <option value="">Assign bus</option>{buses.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber}</option>)}
          </select>
        </article>
      ))}
    </PageShell>
  );
}
