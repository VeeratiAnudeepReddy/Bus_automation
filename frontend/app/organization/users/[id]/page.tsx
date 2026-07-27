'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Archive, CheckCircle2, ExternalLink, RotateCcw, Shield, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import { apiService, AppUser, ManagedUser, UserActivityItem } from '@/lib/api';
import { isOrganizationManagerRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';
import { UserForm, UserFormFields } from '../new/page';

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

function formFromUser(user: ManagedUser): UserForm {
  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    phone: user.phone || '',
    employeeId: user.employeeId || '',
    role: user.role,
    status: user.status,
    department: user.department || '',
    designation: user.designation || '',
    joiningDate: user.joiningDate ? user.joiningDate.slice(0, 10) : '',
    notes: user.notes || '',
    line1: user.address?.line1 || '',
    line2: user.address?.line2 || '',
    city: user.address?.city || 'Hyderabad',
    state: user.address?.state || 'Telangana',
    pincode: user.address?.pincode || '',
    country: user.address?.country || 'India',
    emergencyName: user.emergencyContact?.name || '',
    emergencyPhone: user.emergencyContact?.phone || '',
    emergencyRelation: user.emergencyContact?.relation || '',
    language: user.language || 'en',
    timezone: user.timezone || 'Asia/Kolkata',
    emailNotifications: user.notificationSettings?.email ?? true,
    smsNotifications: user.notificationSettings?.sms ?? false,
    pushNotifications: user.notificationSettings?.push ?? true
  };
}

function payloadFromForm(form: UserForm) {
  return {
    name: form.name,
    email: form.email,
    avatar: form.avatar,
    phone: form.phone,
    employeeId: form.employeeId,
    role: form.role,
    status: form.status,
    department: form.department,
    designation: form.designation,
    joiningDate: form.joiningDate || null,
    notes: form.notes,
    address: {
      line1: form.line1,
      line2: form.line2,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country
    },
    emergencyContact: {
      name: form.emergencyName,
      phone: form.emergencyPhone,
      relation: form.emergencyRelation
    },
    language: form.language,
    timezone: form.timezone,
    notificationSettings: {
      email: form.emailNotifications,
      sms: form.smsNotifications,
      push: form.pushNotifications
    }
  };
}

export default function OrganizationUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { isLoaded, ready, role, getToken } = useAppRole();
  const [managedUser, setManagedUser] = useState<ManagedUser | null>(null);
  const [activity, setActivity] = useState<UserActivityItem[]>([]);
  const [form, setForm] = useState<UserForm | null>(null);
  const [newRole, setNewRole] = useState<AppUser['role']>('customer');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canManage = isOrganizationManagerRole(role);

  const getAuthToken = useCallback(async () => {
    const authToken = await getToken();
    if (!authToken) throw new Error('Missing Clerk token');
    return authToken;
  }, [getToken]);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const authToken = await getAuthToken();
      const data = await apiService.getUser(authToken, params.id);
      setManagedUser(data.user);
      setActivity(data.activity);
      setForm(formFromUser(data.user));
      setNewRole(data.user.role);
    } catch {
      toast.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, params.id]);

  useEffect(() => {
    if (!isLoaded || !ready) return;
    void loadUser();
  }, [isLoaded, loadUser, ready]);

  const update = (field: keyof UserForm, value: string | boolean) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      const response = await apiService.updateUser(authToken, params.id, payloadFromForm(form));
      setManagedUser(response.user);
      setForm(formFromUser(response.user));
      setEditing(false);
      toast.success('User updated');
      await loadUser();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: 'activate' | 'suspend' | 'archive' | 'restore' | 'delete') => {
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      if (action === 'activate') await apiService.activateUser(authToken, params.id);
      if (action === 'suspend') await apiService.suspendUser(authToken, params.id);
      if (action === 'archive') await apiService.archiveUser(authToken, params.id);
      if (action === 'restore') await apiService.restoreUser(authToken, params.id);
      if (action === 'delete') await apiService.deleteUser(authToken, params.id);
      toast.success('User updated');
      await loadUser();
    } catch {
      toast.error('Action failed');
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async () => {
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      await apiService.changeUserRole(authToken, params.id, newRole);
      toast.success('Role updated');
      await loadUser();
    } catch {
      toast.error('Role update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !ready) return <PageShell showTabs={false} />;

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <Link href="/organization/users" className="text-sm text-zinc-500">Back to users</Link>
        {loading ? <p className="mt-3 text-sm text-zinc-500">Loading user...</p> : null}
        {managedUser ? (
          <div className="mt-3 flex items-start gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              {managedUser.avatar ? (
                <span
                  className="block h-full w-full rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${managedUser.avatar})` }}
                />
              ) : (
                initials(managedUser)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-zinc-900">{managedUser.name}</h1>
              <p className="truncate text-sm text-zinc-500">{managedUser.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className={`rounded-full px-2 py-1 ${statusClass(managedUser.status)}`}>{managedUser.status}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">{managedUser.role.replace(/_/g, ' ')}</span>
                {managedUser.employeeId ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">{managedUser.employeeId}</span> : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {managedUser ? (
        <>
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Profile</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <Info label="Phone" value={managedUser.phone} />
              <Info label="Department" value={managedUser.department} />
              <Info label="Designation" value={managedUser.designation} />
              <Info label="Joining date" value={managedUser.joiningDate ? new Date(managedUser.joiningDate).toLocaleDateString() : null} />
              <Info label="Last login" value={managedUser.lastLogin ? new Date(managedUser.lastLogin).toLocaleString() : null} />
              <Info label="Address" value={[managedUser.address?.line1, managedUser.address?.city, managedUser.address?.state].filter(Boolean).join(', ')} />
              <Info label="Emergency contact" value={[managedUser.emergencyContact?.name, managedUser.emergencyContact?.phone].filter(Boolean).join(' · ')} />
              <Info label="Language" value={managedUser.language} />
              <Info label="Timezone" value={managedUser.timezone} />
            </div>
            <button onClick={() => setEditing((value) => !value)} className="mt-3 rounded-xl border border-zinc-200 px-3 py-2 text-sm">
              {editing ? 'Close Edit' : 'Edit Profile'}
            </button>
          </section>

          {editing && form ? (
            <UserFormFields form={form} saving={saving} submitLabel="Save User" onSubmit={onSubmit} update={update} />
          ) : null}

          {canManage ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Administration</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button disabled={saving} onClick={() => void runAction('activate')} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-700"><CheckCircle2 size={15} className="inline" /> Activate</button>
                <button disabled={saving} onClick={() => void runAction('suspend')} className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700"><UserX size={15} className="inline" /> Suspend</button>
                <button disabled={saving} onClick={() => void runAction('archive')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><Archive size={15} className="inline" /> Archive</button>
                <button disabled={saving} onClick={() => void runAction('restore')} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><RotateCcw size={15} className="inline" /> Restore</button>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <select value={newRole} onChange={(event) => setNewRole(event.target.value as AppUser['role'])} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  {roleOptions.map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}
                </select>
                <ActionButton onClick={() => void changeRole()} disabled={saving}>
                  <span className="inline-flex items-center gap-2"><Shield size={16} /> Assign</span>
                </ActionButton>
              </div>
              <a href="https://dashboard.clerk.com/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600">
                Password and sessions are managed in Clerk <ExternalLink size={14} />
              </a>
            </section>
          ) : null}

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Activity Timeline</h2>
            <div className="mt-3 grid gap-2">
              {activity.length ? activity.map((item) => (
                <div key={item._id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                  <p className="font-medium text-zinc-900">{item.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-zinc-500">{item.actorId?.name || item.actorId?.email || 'System'} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No activity recorded for this user.</p>}
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-medium text-zinc-900">{value || 'Not set'}</p>
    </div>
  );
}
