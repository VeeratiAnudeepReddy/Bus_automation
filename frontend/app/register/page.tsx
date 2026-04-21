'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import { apiService } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

export default function RegisterPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{ userId: string; balance: number } | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.syncUser({
        clerkUserId: user.id,
        name: name.trim(),
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: phone.trim()
      });
      setRegistered({ userId: response._id, balance: response.balance });
      toast.success('Registration completed');
    } catch {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return <PageShell showTabs={false} />;
  }

  return (
    <PageShell showTabs={false}>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">User Registration</h1>
        <p className="mt-1 text-sm text-zinc-600">Complete your profile to activate BusQR.</p>
        <form className="mt-5 space-y-3" onSubmit={(event) => void onSubmit(event)}>
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Phone Number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
          <ActionButton className="w-full" disabled={loading} type="submit">
            {loading ? 'Registering...' : 'Register'}
          </ActionButton>
        </form>
      </section>

      {registered ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-sm font-semibold text-emerald-900">Registration Successful</h2>
          <p className="mt-1 text-sm text-emerald-800">User ID: {registered.userId}</p>
          <p className="text-sm text-emerald-800">
            Wallet Balance: {formatCurrency(registered.balance)}
          </p>
          <ActionButton className="mt-3 w-full" onClick={() => router.push('/')}>
            Go to Home
          </ActionButton>
        </section>
      ) : null}
    </PageShell>
  );
}
