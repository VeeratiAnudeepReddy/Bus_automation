'use client';

import { Building2, Ticket, UserPlus } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import { apiService } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

const cards = [
  {
    key: 'customer',
    icon: Ticket,
    title: 'I want to book bus tickets',
    description: 'Create a customer account for bookings, wallet, tickets, coupons, and refunds.',
    permissions: 'Booking, wallet, tickets, coupons'
  },
  {
    key: 'employee',
    icon: UserPlus,
    title: 'I was invited by my organization',
    description: 'Employees join only through an invitation link. Your organization assigns your role.',
    permissions: 'Requires a valid invite link'
  },
  {
    key: 'owner',
    icon: Building2,
    title: 'I own or manage a transport organization',
    description: 'Create an organization workspace, business profile, users, fleet, pricing, finance, and reports.',
    permissions: 'Requires super admin approval after first setup'
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { refreshAuth } = useAppRole();

  const choose = async (key: string) => {
    if (!user) return;
    if (key === 'employee') {
      router.push('/accept-invite');
      return;
    }
    if (key === 'owner') {
      router.push('/organizations/new');
      return;
    }
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      await apiService.createCustomerAccount({
        authToken: token,
        name: user.fullName || 'Bus User',
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.primaryPhoneNumber?.phoneNumber
      });
      await refreshAuth();
      toast.success('Customer account created');
      router.replace('/complete-profile');
    } catch {
      toast.error('Unable to create customer account');
    }
  };

  if (!isLoaded) return <PageShell showTabs={false} />;

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Choose Identity</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">What are you here to do?</h1>
        <p className="mt-2 text-sm text-zinc-600">Authentication only proves who you are. This step creates the correct application account.</p>
      </section>
      <section className="grid gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-zinc-100 p-3"><Icon size={20} /></div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">{card.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600">{card.description}</p>
                  <p className="mt-2 text-xs font-medium text-zinc-500">{card.permissions}</p>
                </div>
              </div>
              <ActionButton className="mt-4 w-full" onClick={() => void choose(card.key)}>Continue</ActionButton>
            </div>
          );
        })}
      </section>
    </PageShell>
  );
}
