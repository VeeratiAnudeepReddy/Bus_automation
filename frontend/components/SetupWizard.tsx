'use client';

import { FormEvent, useMemo, useState } from 'react';
import { SignInButton, SignUpButton, useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import { apiService } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

const steps = ['Welcome', 'Platform', 'Organization', 'Business', 'Logo', 'Address', 'GST', 'Timezone', 'Hours', 'Admin', 'Review'];

export default function SetupWizard({ mode = 'firstRun' }: { mode?: 'firstRun' | 'newOrganization' }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { refreshAuth } = useAppRole();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    slug: '',
    legalName: '',
    website: '',
    logoUrl: '',
    line1: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    gstNumber: '',
    timezone: 'Asia/Kolkata',
    workingHours: '09:00-18:00',
    adminName: '',
    phone: '',
    department: 'Administration',
    employeeId: '',
    designation: 'Organization Owner'
  });

  const title = mode === 'firstRun' ? 'First Run Setup' : 'Create Organization';
  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);
  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      const payload = {
        name: form.name,
        slug: form.slug,
        email: user.primaryEmailAddress?.emailAddress || '',
        adminName: form.adminName || user.fullName || 'Organization Owner',
        phone: form.phone,
        department: form.department,
        employeeId: form.employeeId,
        designation: form.designation,
        timezone: form.timezone,
        workingHours: form.workingHours,
        address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode, country: 'India' },
        businessDetails: { legalName: form.legalName, gstNumber: form.gstNumber, website: form.website },
        branding: { logoUrl: form.logoUrl },
        settings: { timezone: form.timezone }
      };
      const response = mode === 'firstRun'
        ? await apiService.completeFirstRunSetup(token, payload)
        : await apiService.createOwnerOrganization(token, payload);
      await refreshAuth();
      toast.success(mode === 'firstRun' ? 'Platform setup complete' : 'Organization created');
      router.replace(response.redirectTo || '/organization');
    } catch {
      toast.error('Setup failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <PageShell showTabs={false} />;

  if (!user) {
    return (
      <PageShell showTabs={false}>
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-zinc-500">BusQR Enterprise</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{title}</h1>
          <p className="mt-2 text-sm text-zinc-600">Sign in or create the administrator Clerk account to continue setup.</p>
          <div className="mt-5 grid gap-2">
            <SignUpButton mode="modal"><button className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white">Create Administrator</button></SignUpButton>
            <SignInButton mode="modal"><button className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium">Sign In</button></SignInButton>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">{steps[step]}</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{title}</h1>
        <div className="mt-4 h-2 rounded-full bg-zinc-100"><div className="h-2 rounded-full bg-black" style={{ width: `${progress}%` }} /></div>
      </section>

      <form onSubmit={(event) => void submit(event)} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3">
          {fieldsForStep(step).map((field) => (
            <label key={field.key} className="text-xs font-medium text-zinc-600">
              {field.label}
              <input
                value={form[field.key] || ''}
                onChange={(event) => setField(field.key, event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                required={field.required}
              />
            </label>
          ))}
          {step === 0 ? <p className="text-sm text-zinc-600">This wizard creates the first organization and assigns you as organization owner. It disappears after setup is complete.</p> : null}
          {step === steps.length - 1 ? (
            <div className="max-h-64 overflow-auto rounded-xl bg-zinc-100 p-3 text-xs text-zinc-700">
              {Object.entries(form).map(([key, value]) => (
                <p key={key} className="flex justify-between gap-4 border-b border-zinc-200 py-1 last:border-b-0">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-right">{String(value || 'Not provided')}</span>
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <ActionButton type="button" variant="outline" disabled={step === 0} onClick={() => setStep((prev) => Math.max(0, prev - 1))}>Back</ActionButton>
          {step < steps.length - 1 ? (
            <ActionButton type="button" onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}>Next</ActionButton>
          ) : (
            <ActionButton type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Organization'}</ActionButton>
          )}
        </div>
      </form>
    </PageShell>
  );
}

function fieldsForStep(step: number) {
  const groups = [
    [],
    [{ key: 'name', label: 'Platform / Organization Name', required: true }, { key: 'slug', label: 'Slug', required: true }],
    [{ key: 'name', label: 'Organization Name', required: true }, { key: 'city', label: 'Operating City', required: true }],
    [{ key: 'legalName', label: 'Legal Name' }, { key: 'website', label: 'Website' }],
    [{ key: 'logoUrl', label: 'Logo URL' }],
    [{ key: 'line1', label: 'Address Line' }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'pincode', label: 'Pincode' }],
    [{ key: 'gstNumber', label: 'GST Number' }],
    [{ key: 'timezone', label: 'Timezone', required: true }],
    [{ key: 'workingHours', label: 'Working Hours', required: true }],
    [{ key: 'adminName', label: 'Administrator Name', required: true }, { key: 'phone', label: 'Phone', required: true }, { key: 'employeeId', label: 'Employee ID' }, { key: 'designation', label: 'Designation' }],
    []
  ];
  return groups[step] || [];
}
