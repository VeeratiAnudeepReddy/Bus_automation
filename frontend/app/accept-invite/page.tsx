'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Suspense } from 'react';
import { SignInButton, SignUpButton, useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import { apiService, OrganizationInvite } from '@/lib/api';
import { dashboardForRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<PageShell showTabs={false} />}>
      <AcceptInviteContent />
    </Suspense>
  );
}

function AcceptInviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { refreshAuth } = useAppRole();
  const [invite, setInvite] = useState<OrganizationInvite | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', department: '', employeeId: '', designation: '' });

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await apiService.validateInviteToken(token);
        setInvite(response.invite);
      } catch {
        toast.error('Invite is invalid or expired');
      }
    };
    void load();
  }, [token]);

  const accept = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !token || !invite) return;
    try {
      const authToken = await getToken();
      if (!authToken) throw new Error('Missing Clerk token');
      const response = await apiService.acceptInviteToken(authToken, token, {
        ...form,
        email: user.primaryEmailAddress?.emailAddress || ''
      });
      await refreshAuth();
      toast.success('Invite accepted');
      router.replace(response.user.profileComplete ? dashboardForRole(response.user.role) : '/complete-profile');
    } catch {
      toast.error('Unable to accept invite');
    }
  };

  if (!isLoaded) return <PageShell showTabs={false} />;

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Employee Invitation</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{invite ? `Join as ${invite.role}` : 'Accept Invite'}</h1>
        <p className="mt-2 text-sm text-zinc-600">{invite ? `Invite for ${invite.email}` : 'Paste or open a valid invite link.'}</p>
      </section>

      {!user ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-600">Sign up or sign in with the invited email address.</p>
          <div className="mt-4 grid gap-2">
            <SignUpButton mode="modal"><button className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white">Sign Up</button></SignUpButton>
            <SignInButton mode="modal"><button className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium">Sign In</button></SignInButton>
          </div>
        </section>
      ) : (
        <form onSubmit={(event) => void accept(event)} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          {(['name', 'phone', 'department', 'employeeId', 'designation'] as const).map((field) => (
            <input
              key={field}
              value={form[field]}
              onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
              placeholder={field}
              className="mb-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
              required={field === 'name' || field === 'phone'}
            />
          ))}
          <ActionButton className="w-full" type="submit" disabled={!invite}>Accept Invite</ActionButton>
        </form>
      )}
    </PageShell>
  );
}
