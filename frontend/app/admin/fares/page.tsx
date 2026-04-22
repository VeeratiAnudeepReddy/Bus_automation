'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import { apiService, RouteItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';
import { formatCurrency } from '@/lib/format';

type RouteForm = {
  from: string;
  to: string;
  fare: string;
  fromLat: string;
  fromLng: string;
  toLat: string;
  toLng: string;
};

const emptyForm: RouteForm = {
  from: '',
  to: '',
  fare: '',
  fromLat: '',
  fromLng: '',
  toLat: '',
  toLng: ''
};

export default function FareManagementPage() {
  const { isLoaded, user, role, ready } = useAppRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<RouteForm>(emptyForm);
  const [editing, setEditing] = useState<RouteItem | null>(null);
  const [editForm, setEditForm] = useState<RouteForm>(emptyForm);

  const allowed = role === 'admin' || role === 'fare_manager';

  const loadRoutes = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.getAdminRoutes(user.id, {
        search: search || undefined,
        status
      });
      setRoutes(data.routes);
    } catch {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [search, status, user]);

  useEffect(() => {
    if (!isLoaded || !ready || !user || !allowed) {
      return;
    }
    void loadRoutes();
  }, [isLoaded, ready, user, allowed, loadRoutes]);

  const routeRows = useMemo(() => routes, [routes]);

  const resetCreateForm = () => {
    setCreateForm(emptyForm);
  };

  const toPayload = (form: RouteForm) => ({
    from: form.from.trim(),
    to: form.to.trim(),
    fare: Number(form.fare),
    fromCoords: { lat: Number(form.fromLat), lng: Number(form.fromLng) },
    toCoords: { lat: Number(form.toLat), lng: Number(form.toLng) },
    city: 'Hyderabad'
  });

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setSaving(true);
    try {
      await apiService.createAdminRoute(user.id, toPayload(createForm));
      toast.success('Route added');
      setShowCreate(false);
      resetCreateForm();
      await loadRoutes();
    } catch {
      toast.error('Failed to add route');
    } finally {
      setSaving(false);
    }
  };

  const onOpenEdit = (route: RouteItem) => {
    setEditing(route);
    setEditForm({
      from: route.from,
      to: route.to,
      fare: String(route.fare),
      fromLat: String(route.fromCoords.lat),
      fromLng: String(route.fromCoords.lng),
      toLat: String(route.toCoords.lat),
      toLng: String(route.toCoords.lng)
    });
  };

  const onSaveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !editing) {
      return;
    }
    setSaving(true);
    try {
      await apiService.updateAdminRoute(user.id, editing._id, toPayload(editForm));
      toast.success('Route updated');
      setEditing(null);
      await loadRoutes();
    } catch {
      toast.error('Failed to update route');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (route: RouteItem) => {
    if (!user) {
      return;
    }
    setSaving(true);
    try {
      await apiService.deleteAdminRoute(user.id, route._id);
      toast.success('Route deleted');
      await loadRoutes();
    } catch {
      toast.error('Failed to delete route');
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (route: RouteItem) => {
    if (!user) {
      return;
    }
    setSaving(true);
    try {
      await apiService.toggleAdminRoute(user.id, route._id);
      toast.success(route.active ? 'Route disabled' : 'Route enabled');
      await loadRoutes();
    } catch {
      toast.error('Failed to toggle route');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !ready) {
    return <PageShell showTabs={false} />;
  }

  return (
    <PageShell showTabs={false}>
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Fare Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage Hyderabad routes and fixed fare configuration.</p>
        {!allowed ? <p className="mt-3 text-sm text-zinc-500">Admin or fare manager access required.</p> : null}
      </section>

      {allowed ? (
        <>
          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search routes..."
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as 'all' | 'active' | 'inactive')}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
              >
                <option value="all">All Routes</option>
                <option value="active">Active Routes</option>
                <option value="inactive">Inactive Routes</option>
              </select>
            </div>
            <ActionButton className="mt-3 w-full" onClick={() => setShowCreate((prev) => !prev)}>
              {showCreate ? 'Close Add Route' : 'Add Route'}
            </ActionButton>
          </section>

          {showCreate ? (
            <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Add Route</h2>
              <form className="mt-3 grid gap-2" onSubmit={(event) => void onCreate(event)}>
                <input
                  required
                  value={createForm.from}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, from: event.target.value }))}
                  placeholder="From stop"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <input
                  required
                  value={createForm.to}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, to: event.target.value }))}
                  placeholder="To stop"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <input
                  required
                  type="number"
                  min="1"
                  value={createForm.fare}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, fare: event.target.value }))}
                  placeholder="Fare"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="number"
                    step="any"
                    value={createForm.fromLat}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, fromLat: event.target.value }))}
                    placeholder="From lat"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    value={createForm.fromLng}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, fromLng: event.target.value }))}
                    placeholder="From lng"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    value={createForm.toLat}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, toLat: event.target.value }))}
                    placeholder="To lat"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    value={createForm.toLng}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, toLng: event.target.value }))}
                    placeholder="To lng"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>
                <ActionButton type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Create Route'}
                </ActionButton>
              </form>
            </section>
          ) : null}

          {editing ? (
            <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Edit Route</h2>
              <form className="mt-3 grid gap-2" onSubmit={(event) => void onSaveEdit(event)}>
                <input
                  required
                  value={editForm.from}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, from: event.target.value }))}
                  placeholder="From stop"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <input
                  required
                  value={editForm.to}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, to: event.target.value }))}
                  placeholder="To stop"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <input
                  required
                  type="number"
                  min="1"
                  value={editForm.fare}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, fare: event.target.value }))}
                  placeholder="Fare"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="number"
                    step="any"
                    value={editForm.fromLat}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, fromLat: event.target.value }))}
                    placeholder="From lat"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    value={editForm.fromLng}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, fromLng: event.target.value }))}
                    placeholder="From lng"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    value={editForm.toLat}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, toLat: event.target.value }))}
                    placeholder="To lat"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    value={editForm.toLng}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, toLng: event.target.value }))}
                    placeholder="To lng"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </ActionButton>
                  <ActionButton type="button" variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </ActionButton>
                </div>
              </form>
            </section>
          ) : null}

          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Active Fare List</h2>
            <div className="mt-3 space-y-2">
              {loading ? (
                <p className="text-sm text-zinc-500">Loading routes...</p>
              ) : routeRows.length === 0 ? (
                <p className="text-sm text-zinc-500">No routes found.</p>
              ) : (
                routeRows.map((route) => (
                  <div key={route._id} className="rounded-xl border border-zinc-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-900">
                        {route.from} → {route.to}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${route.active ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                        {route.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{formatCurrency(route.fare)}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <ActionButton variant="outline" onClick={() => onOpenEdit(route)}>
                        Edit
                      </ActionButton>
                      <ActionButton variant="outline" onClick={() => void onToggle(route)} disabled={saving}>
                        {route.active ? 'Disable' : 'Enable'}
                      </ActionButton>
                      <ActionButton variant="outline" onClick={() => void onDelete(route)} disabled={saving}>
                        Delete
                      </ActionButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
