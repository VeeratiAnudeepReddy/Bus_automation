'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import WalletCard from '@/components/WalletCard';
import ActionButton from '@/components/ActionButton';
import { apiService, TicketItem } from '@/lib/api';
import { addActivity, getActivities } from '@/lib/activity';
import { BUS_FARE, formatCurrency, formatDateTime } from '@/lib/format';
import { useAppRole } from '@/lib/useAppRole';

export default function WalletPage() {
  const router = useRouter();
  const { isLoaded, user, role, ready } = useAppRole();
  const [balance, setBalance] = useState(0);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState(getActivities());

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) {
        return;
      }
      if (role === 'admin' || role === 'fare_manager') {
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getMyTickets(user.id);
        setBalance(data.balance);
        setTickets(data.tickets);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isLoaded, role, user]);

  useEffect(() => {
    if (ready && (role === 'admin' || role === 'fare_manager')) {
      router.replace('/admin');
    }
  }, [ready, role, router]);

  const transactions = useMemo(() => {
    const fromTickets = tickets.map((ticket) => ({
      id: ticket.ticketId,
      title: 'Ticket',
      amount: -(ticket.fare ?? BUS_FARE),
      createdAt: ticket.createdAt
    }));

    const fromRecharge = activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      amount: activity.amount ?? 0,
      createdAt: activity.createdAt
    }));

    return [...fromRecharge, ...fromTickets]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 10);
  }, [activities, tickets]);

  const recharge = async () => {
    if (!user) {
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a valid recharge amount');
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.addBalance(user.id, value);
      setBalance(response.balance);
      addActivity({ title: 'Recharge', subtitle: 'Wallet Top-up', amount: value });
      setActivities(getActivities());
      toast.success('Wallet recharged');
    } catch {
      toast.error('Recharge failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isLoaded || !ready) {
    return <PageShell />;
  }

  return (
    <PageShell>
      <WalletCard balance={balance} />

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Recharge Wallet</h1>
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="mt-3 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-black"
          placeholder="Recharge Amount"
        />
        <ActionButton className="mt-3 w-full" disabled={saving} onClick={() => void recharge()}>
          {saving ? 'Processing...' : 'Recharge'}
        </ActionButton>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Transaction History</h2>
        <div className="mt-3 space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-zinc-500">No transactions yet.</p>
          ) : (
            transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-zinc-900">{txn.title}</p>
                  <p className="text-xs text-zinc-500">{formatDateTime(txn.createdAt)}</p>
                </div>
                <p className={txn.amount >= 0 ? 'text-emerald-600' : 'text-zinc-800'}>
                  {txn.amount >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(txn.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
