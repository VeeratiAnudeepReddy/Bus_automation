'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export type UserForm = {
  name: string;
  email: string;
  avatar: string;
  phone: string;
  employeeId: string;
  role: AppUser['role'];
  status: UserStatus;
  department: string;
  designation: string;
  joiningDate: string;
  notes: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
};

const emptyForm: UserForm = {
  name: '',
  email: '',
  avatar: '',
  phone: '',
  employeeId: '',
  role: 'customer',
  status: 'PENDING',
  department: '',
  designation: '',
  joiningDate: '',
  notes: '',
  line1: '',
  line2: '',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '',
  country: 'India',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  language: 'en',
  timezone: 'Asia/Kolkata',
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true
};

function payload(form: UserForm): Partial<ManagedUser> & { name: string; email: string } {
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

export default function NewOrganizationUserPage() {
  const router = useRouter();
  const { isLoaded, ready, role, getToken } = useAppRole();
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const canManage = isOrganizationManagerRole(role);

  const update = (field: keyof UserForm, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const authToken = await getToken();
      if (!authToken) throw new Error('Missing Clerk token');
      const response = await apiService.createUser(authToken, payload(form));
      toast.success('User created');
      router.push(`/organization/users/${response.user._id}`);
    } catch {
      toast.error('Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !ready) return <PageShell showTabs={false} />;

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Create User</h1>
        <p className="mt-1 text-sm text-zinc-600">Create an organization member with role, profile, and notification settings.</p>
        {!canManage ? <p className="mt-3 text-sm text-zinc-500">Organization manager access required.</p> : null}
      </section>

      {canManage ? (
        <UserFormFields form={form} saving={saving} submitLabel="Create User" onSubmit={onSubmit} update={update} />
      ) : null}
    </PageShell>
  );
}

export function UserFormFields({
  form,
  saving,
  submitLabel,
  onSubmit,
  update
}: {
  form: UserForm;
  saving: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent) => void;
  update: (field: keyof UserForm, value: string | boolean) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <Section title="Identity">
        <Field label="Name" required value={form.name} onChange={(value) => update('name', value)} />
        <Field label="Email" type="email" required value={form.email} onChange={(value) => update('email', value)} />
        <Field label="Avatar URL" value={form.avatar} onChange={(value) => update('avatar', value)} />
        <Field label="Phone" value={form.phone} onChange={(value) => update('phone', value)} />
        <Field label="Employee ID" value={form.employeeId} onChange={(value) => update('employeeId', value.toUpperCase())} />
      </Section>

      <Section title="Role and Work">
        <label className="grid gap-1 text-xs font-medium text-zinc-600">
          Role
          <select value={form.role} onChange={(event) => update('role', event.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            {roleOptions.map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-zinc-600">
          Status
          <select value={form.status} onChange={(event) => update('status', event.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <Field label="Department" value={form.department} onChange={(value) => update('department', value)} />
        <Field label="Designation" value={form.designation} onChange={(value) => update('designation', value)} />
        <Field label="Joining date" type="date" value={form.joiningDate} onChange={(value) => update('joiningDate', value)} />
        <Field label="Notes" value={form.notes} onChange={(value) => update('notes', value)} />
      </Section>

      <Section title="Address">
        <Field label="Line 1" value={form.line1} onChange={(value) => update('line1', value)} />
        <Field label="Line 2" value={form.line2} onChange={(value) => update('line2', value)} />
        <Field label="City" value={form.city} onChange={(value) => update('city', value)} />
        <Field label="State" value={form.state} onChange={(value) => update('state', value)} />
        <Field label="Pincode" value={form.pincode} onChange={(value) => update('pincode', value)} />
        <Field label="Country" value={form.country} onChange={(value) => update('country', value)} />
      </Section>

      <Section title="Emergency and Preferences">
        <Field label="Emergency contact" value={form.emergencyName} onChange={(value) => update('emergencyName', value)} />
        <Field label="Emergency phone" value={form.emergencyPhone} onChange={(value) => update('emergencyPhone', value)} />
        <Field label="Relation" value={form.emergencyRelation} onChange={(value) => update('emergencyRelation', value)} />
        <Field label="Language" value={form.language} onChange={(value) => update('language', value)} />
        <Field label="Timezone" value={form.timezone} onChange={(value) => update('timezone', value)} />
        <CheckField label="Email notifications" value={form.emailNotifications} onChange={(value) => update('emailNotifications', value)} />
        <CheckField label="SMS notifications" value={form.smsNotifications} onChange={(value) => update('smsNotifications', value)} />
        <CheckField label="Push notifications" value={form.pushNotifications} onChange={(value) => update('pushNotifications', value)} />
      </Section>

      <ActionButton type="submit" disabled={saving}>{saving ? 'Saving...' : submitLabel}</ActionButton>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-xs font-semibold uppercase text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-600">
      {label}
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-black" />
    </label>
  );
}

function CheckField({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
      {label}
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
