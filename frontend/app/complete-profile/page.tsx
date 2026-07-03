'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import { apiService } from '@/lib/api';
import { dashboardForRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { appUser, refreshAuth } = useAppRole();
  const role = appUser?.role || 'customer';
  const [form, setForm] = useState({
    avatar: '',
    phone: appUser?.phone === 'N/A' ? '' : appUser?.phone || '',
    emergencyName: '',
    emergencyPhone: '',
    line1: '',
    city: appUser?.address?.city || 'Hyderabad',
    language: appUser?.language || 'en',
    timezone: appUser?.timezone || 'Asia/Kolkata',
    department: appUser?.department || '',
    employeeId: appUser?.employeeId || '',
    designation: appUser?.designation || '',
    drivingLicense: '',
    businessInfoCompleted: ''
  });
  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      const user = await apiService.completeProfile(token, {
        avatar: form.avatar || null,
        phone: form.phone,
        emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone },
        address: { line1: form.line1, city: form.city, country: 'India' },
        language: form.language,
        timezone: form.timezone,
        department: form.department,
        employeeId: form.employeeId,
        designation: form.designation,
        metadata: { drivingLicense: form.drivingLicense },
        businessInfoCompleted: form.businessInfoCompleted === 'yes'
      });
      await refreshAuth();
      toast.success('Profile completed');
      router.replace(dashboardForRole(user.role));
    } catch {
      toast.error('Failed to complete profile');
    }
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Profile Completion</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Complete your {labelForRole(role)} profile</h1>
        <p className="mt-2 text-sm text-zinc-600">{descriptionForRole(role)}</p>
      </section>
      <form onSubmit={(event) => void submit(event)} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        {fieldsForRole(role).map(([key, label, required]) => (
          <label key={key} className="mb-3 block text-xs font-medium text-zinc-600">
            {label}
            <input
              value={form[key as keyof typeof form]}
              onChange={(event) => setField(key, event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
              required={required === 'required'}
            />
          </label>
        ))}
        <ActionButton className="w-full" type="submit">Continue</ActionButton>
      </form>
    </PageShell>
  );
}

function labelForRole(role: string) {
  if (role === 'customer' || role === 'user') return 'customer';
  if (role === 'driver') return 'driver';
  if (role === 'conductor' || role === 'admin') return 'conductor';
  if (role === 'org_owner' || role === 'org_admin') return 'organization owner';
  return 'employee';
}

function descriptionForRole(role: string) {
  if (role === 'customer' || role === 'user') return 'Customers only need contact and emergency details before booking.';
  if (role === 'driver') return 'Drivers need contact details, emergency contact, and driving licence information.';
  if (role === 'conductor' || role === 'admin') return 'Conductors need contact details and emergency contact before scanner access.';
  if (role === 'org_owner' || role === 'org_admin') return 'Organization owners complete business-facing profile details.';
  return 'Complete the minimum information needed for your assigned workspace.';
}

function fieldsForRole(role: string): [string, string, 'required' | 'optional'][] {
  const base: [string, string, 'required' | 'optional'][] = [
    ['avatar', 'Photo URL', 'optional'],
    ['phone', 'Phone', 'required'],
    ['emergencyName', 'Emergency Contact Name', 'optional'],
    ['emergencyPhone', 'Emergency Contact Phone', 'optional'],
    ['language', 'Language', 'required'],
    ['timezone', 'Timezone', 'required']
  ];
  if (role === 'customer' || role === 'user') {
    return [...base, ['line1', 'Address', 'optional'], ['city', 'City', 'required']];
  }
  if (role === 'driver') {
    return [...base, ['drivingLicense', 'Driving Licence Number', 'required']];
  }
  if (role === 'conductor' || role === 'admin') {
    return base;
  }
  if (role === 'org_owner' || role === 'org_admin') {
    return [...base, ['department', 'Department', 'optional'], ['designation', 'Designation', 'optional'], ['businessInfoCompleted', 'Business Info Completed? type yes', 'required']];
  }
  return [...base, ['department', 'Department', 'optional'], ['employeeId', 'Employee ID', 'optional'], ['designation', 'Designation', 'optional']];
}
