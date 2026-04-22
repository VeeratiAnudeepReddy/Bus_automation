'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QrCode, Ticket, Wallet } from 'lucide-react';
import PageShell from '@/components/PageShell';
import WalletCard from '@/components/WalletCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { apiService, TicketItem } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useAppRole } from '@/lib/useAppRole';

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, user, role, ready } = useAppRole();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      if (role === 'admin' || role === 'fare_manager') {
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getMyTickets(user.id);
        setBalance(data.balance);
        setTickets(data.tickets.slice(0, 3));
      } catch {
        window.location.href = '/register';
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    void load();
  }, [isLoaded, role, user]);

  useEffect(() => {
    if (ready && (role === 'admin' || role === 'fare_manager')) {
      router.replace('/admin');
    }
  }, [ready, role, router]);

  if (!isLoaded || !ready || loading) {
    return (
      <PageShell showTabs={false}>
        <LoadingSkeleton className="h-28" />
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell showTabs={false}>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">BusQR</h1>
          <p className="mt-2 text-sm text-zinc-600">Smart QR Code Bus Ticketing System</p>
          <div className="mt-5 grid gap-3">
            <SignInButton mode="modal">
              <button className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900">
                Create Account
              </button>
            </SignUpButton>
          </div>
        </div>
      </PageShell>
      );
  }

  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-zinc-500">Welcome</p>
        <h2 className="text-xl font-semibold text-zinc-900">{user.fullName || 'Bus User'}</h2>
        <div className="mt-4">
          <WalletCard balance={balance} />
          <Link
            href="/wallet"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
          >
            Recharge Wallet
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/generate" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <QrCode className="text-black" size={20} />
          <p className="mt-2 text-sm font-medium text-zinc-900">Generate QR Ticket</p>
        </Link>
        <Link href="/tickets" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <Ticket className="text-black" size={20} />
          <p className="mt-2 text-sm font-medium text-zinc-900">View My Tickets</p>
        </Link>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Wallet size={16} className="text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-900">Recent Activity</h3>
        </div>
        {tickets.length === 0 ? (
          <p className="text-sm text-zinc-500">No recent activity yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.ticketId} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-zinc-900">Ticket Purchased</p>
                  <p className="text-xs text-zinc-500">{formatDateTime(ticket.createdAt)}</p>
                </div>
                <span className="font-medium text-zinc-800">-₹20</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
