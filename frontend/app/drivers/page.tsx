'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, BusItem, DriverProfile, ManagedUser } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function DriversPage() {
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [form, setForm] = useState({ userId: '', licenseNumber: '', expiryDate: '', experienceYears: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const load = async () => {
    if (!user) return;
    const token = await getToken();
    if (!token) return;
    const [driverData, userData, busData] = await Promise.all([
      apiService.listDrivers(token, { search, status }),
      apiService.listUsers(token, { role: 'driver', limit: 50 }),
      apiService.listBuses(token, { status: 'all', limit: 50 })
    ]);
    setDrivers(driverData.items);
    setUsers(userData.users);
    setBuses(busData.items);
  };

  useEffect(() => {
    if (isLoaded && ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, ready, search, status]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      await apiService.createDriver(token, form);
      toast.success('Driver profile created');
      setForm({ userId: '', licenseNumber: '', expiryDate: '', experienceYears: 0 });
      await load();
    } catch {
      toast.error('Failed to create driver');
    }
  };

  const assign = async (id: string, busId: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      await apiService.assignDriverBus(token, id, busId);
      toast.success('Driver assigned');
      await load();
    } catch {
      toast.error('Assignment blocked');
    }
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold">Driver Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Profiles, licenses, assignments, attendance, ratings, medical status, and history.</p>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search license/status" className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          <option value="all">All statuses</option><option value="available">Available</option><option value="assigned">Assigned</option><option value="on_leave">On leave</option><option value="suspended">Suspended</option>
        </select>
      </section>
      <form onSubmit={(e) => void submit(e)} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Create Driver Profile</h2>
        <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
          <option value="">Select driver user</option>{users.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.email}</option>)}
        </select>
        <input required value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value.toUpperCase() })} placeholder="License number" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} placeholder="Experience years" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        <ActionButton type="submit">Create Driver</ActionButton>
      </form>
      {drivers.map((driver) => (
        <article key={driver._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between"><div><h2 className="font-semibold">{driver.licenseNumber}</h2><p className="text-sm text-zinc-500">Expires {new Date(driver.expiryDate).toLocaleDateString()}</p></div><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">{driver.status}</span></div>
          <p className="mt-2 text-sm text-zinc-600">Rating {driver.rating ?? 0}/5 · Experience {driver.experienceYears} years</p>
          <select value={driver.assignedBus || ''} onChange={(e) => void assign(driver._id, e.target.value)} className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            <option value="">Assign bus</option>{buses.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber}</option>)}
          </select>
        </article>
      ))}
    </PageShell>
  );
}
