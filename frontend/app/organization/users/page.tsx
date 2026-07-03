'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  Plus,
  Search,
  Shield,
  UserX
} from 'lucide-react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, AppUser, ManagedUser, UserStatus } from '@/lib/api';
import { isOrganizationManagerRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';

const roleOptions: AppUser['role'][] = [
  'org_admin',
  'operations_manager',
  'fleet_manager',
  'finance_manager',
  'price_manager',
  'dispatcher',
  'scheduler',
  'bus_manager',
  'driver',
  'conductor',
  'support',
  'customer'
];
const statusOptions: UserStatus[] = ['ACTIVE', 'PENDING', 'INVITED', 'SUSPENDED', 'DEACTIVATED', 'ARCHIVED'];

function statusClass(status: string) {
  if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700';
  if (status === 'PENDING' || status === 'INVITED') return 'bg-amber-50 text-amber-700';
  if (status === 'SUSPENDED' || status === 'DEACTIVATED') return 'bg-red-50 text-red-700';
  return 'bg-zinc-100 text-zinc-600';
}

function initials(user: ManagedUser) {
  return user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function OrganizationUsersPage() {
  const { isLoaded, ready, user, role, getToken } = useAppRole();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [userRole, setUserRole] = useState('all');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [bulkRole, setBulkRole] = useState<AppUser['role']>('conductor');

  const canManage = isOrganizationManagerRole(role);
  const canRead = canManage || role === 'operations_manager' || role === 'finance_manager' || role === 'super_admin';
  const allSelected = users.length > 0 && users.every((item) => selected.includes(item._id));

  const getAuthToken = useCallback(async () => {
    const authToken = await getToken();
    if (!authToken) throw new Error('Missing Clerk token');
    return authToken;
  }, [getToken]);

  const loadUsers = useCallback(async () => {
    if (!user || !canRead) return;
    setLoading(true);
    try {
      const authToken = await getAuthToken();
      const data = await apiService.listUsers(authToken, {
        search: search || undefined,
        role: userRole,
        status,
        department: department || undefined,
        designation: designation || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10
      });
      setUsers(data.users);
      setPages(data.pagination.pages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [canRead, department, designation, getAuthToken, page, search, sortBy, sortOrder, status, user, userRole]);

  useEffect(() => {
    if (!isLoaded || !ready) return;
    void loadUsers();
  }, [isLoaded, loadUsers, ready]);

  const selectedUsers = useMemo(() => users.filter((item) => selected.includes(item._id)), [selected, users]);

  const toggleSelected = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const runBulk = async (action: string) => {
    if (!selected.length) {
      toast.error('Select users first');
      return;
    }
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      const response = await apiService.bulkUsers(authToken, {
        action,
        userIds: selected,
        role: action === 'role' ? bulkRole : undefined
      });
      toast.success(`${response.modified} users updated`);
      setSelected([]);
      await loadUsers();
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setSaving(false);
    }
  };

  const runQuick = async (action: 'activate' | 'suspend' | 'archive' | 'delete', item: ManagedUser) => {
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      if (action === 'activate') await apiService.activateUser(authToken, item._id);
      if (action === 'suspend') await apiService.suspendUser(authToken, item._id);
      if (action === 'archive') await apiService.archiveUser(authToken, item._id);
      if (action === 'delete') await apiService.deleteUser(authToken, item._id);
      toast.success('User updated');
      await loadUsers();
    } catch {
      toast.error('Action failed');
    } finally {
      setSaving(false);
    }
  };

  const exportUsers = async () => {
    try {
      const authToken = await getAuthToken();
      const csv = await apiService.exportUsers(authToken, {
        search: search || undefined,
        role: userRole,
        status,
        department: department || undefined,
        designation: designation || undefined,
        sortBy,
        sortOrder
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'users.csv';
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Export ready');
    } catch {
      toast.error('Export failed');
    }
  };

  const importUsers = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const parsed = JSON.parse(importText) as Partial<ManagedUser>[];
      const authToken = await getAuthToken();
      const response = await apiService.importUsers(authToken, { users: parsed, rollbackOnError: false });
      toast.success(`${response.created.length} users imported, ${response.errors.length} errors`);
      setShowImport(false);
      setImportText('');
      await loadUsers();
    } catch {
      toast.error('Import expects a JSON array of users');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !ready) return <PageShell showTabs={false} />;

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Enterprise User Management</h1>
            <p className="mt-1 text-sm text-zinc-600">Search, filter, manage roles, import, export, and audit users.</p>
          </div>
          {canManage ? (
            <Link href="/organization/users/new" className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white">
              <span className="inline-flex items-center gap-2">
                <Plus size={16} /> New
              </span>
            </Link>
          ) : null}
        </div>
        {!canRead ? <p className="mt-3 text-sm text-zinc-500">User management access required.</p> : null}
      </section>

      {canRead ? (
        <>
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="grid gap-2">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-400" size={16} />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, email, employee ID, phone, role"
                  className="w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-black"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  <option value="all">All statuses</option>
                  {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={userRole} onChange={(event) => setUserRole(event.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  <option value="all">All roles</option>
                  {roleOptions.map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}
                </select>
                <input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Department" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                <input value={designation} onChange={(event) => setDesignation(event.target.value)} placeholder="Designation" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  <option value="createdAt">Created</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                  <option value="joiningDate">Joining date</option>
                </select>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton onClick={() => void exportUsers()}>
                  <span className="inline-flex items-center gap-2"><Download size={16} /> Export</span>
                </ActionButton>
                {canManage ? (
                  <button type="button" onClick={() => setShowImport(true)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                    <span className="inline-flex items-center gap-2"><FileUp size={16} /> Import</span>
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          {canManage && selected.length ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-zinc-900">{selected.length} selected</p>
              <p className="mt-1 text-xs text-zinc-500">{selectedUsers.map((item) => item.name).join(', ')}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button disabled={saving} onClick={() => void runBulk('activate')} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-700">Activate</button>
                <button disabled={saving} onClick={() => void runBulk('suspend')} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">Suspend</button>
                <button disabled={saving} onClick={() => void runBulk('archive')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Archive</button>
                <button disabled={saving} onClick={() => void runBulk('delete')} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button>
              </div>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <select value={bulkRole} onChange={(event) => setBulkRole(event.target.value as AppUser['role'])} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  {roleOptions.map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}
                </select>
                <button disabled={saving} onClick={() => void runBulk('role')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Assign</button>
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : users.map((item) => item._id))} />
                Select page
              </label>
              <span className="text-xs text-zinc-500">Page {page} of {pages}</span>
            </div>
            <div className="grid gap-2">
              {loading ? <p className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500">Loading users...</p> : null}
              {!loading && users.length === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No users match the current filters.</p>
              ) : null}
              {users.map((item) => (
                <article key={item._id} className="rounded-xl border border-zinc-200 p-3">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.includes(item._id)} onChange={() => toggleSelected(item._id)} className="mt-3" />
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                      {item.avatar ? (
                        <span
                          className="block h-full w-full rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.avatar})` }}
                        />
                      ) : (
                        initials(item)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/organization/users/${item._id}`} className="font-medium text-zinc-900">{item.name}</Link>
                          <p className="truncate text-xs text-zinc-500">{item.email}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${statusClass(item.status)}`}>{item.status}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700"><Shield size={12} className="inline" /> {item.role.replace(/_/g, ' ')}</span>
                        {item.department ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">{item.department}</span> : null}
                        {item.employeeId ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">{item.employeeId}</span> : null}
                      </div>
                    </div>
                  </div>
                  {canManage ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <button onClick={() => void runQuick('activate', item)} className="rounded-lg border border-emerald-200 px-2 py-1 text-emerald-700"><CheckCircle2 size={13} className="inline" /> Activate</button>
                      <button onClick={() => void runQuick('suspend', item)} className="rounded-lg border border-red-200 px-2 py-1 text-red-700"><UserX size={13} className="inline" /> Suspend</button>
                      <button onClick={() => void runQuick('archive', item)} className="rounded-lg border border-zinc-200 px-2 py-1"><Archive size={13} className="inline" /> Archive</button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs disabled:opacity-40">
                <ChevronLeft size={14} /> Prev
              </button>
              <button disabled={page >= pages} onClick={() => setPage((value) => Math.min(value + 1, pages))} className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs disabled:opacity-40">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </section>
        </>
      ) : null}

      {showImport ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <form onSubmit={(event) => void importUsers(event)} className="mx-auto my-8 grid max-w-md gap-3 rounded-2xl bg-white p-4 shadow-xl">
            <h2 className="text-base font-semibold text-zinc-900">Import Users</h2>
            <p className="text-sm text-zinc-600">Paste a JSON array. Duplicate emails are reported without importing that row.</p>
            <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={10} className="rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-black" placeholder='[{"name":"Driver One","email":"driver@example.com","role":"driver"}]' />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowImport(false)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">Cancel</button>
              <ActionButton type="submit" disabled={saving}>Import</ActionButton>
            </div>
          </form>
        </div>
      ) : null}
    </PageShell>
  );
}
