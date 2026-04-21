'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import WalletCard from '@/components/WalletCard';
import { apiService, TicketItem } from '@/lib/api';
import { addActivity } from '@/lib/activity';
import { BUS_FARE, formatCurrency } from '@/lib/format';
import { useAppRole } from '@/lib/useAppRole';

export default function GenerateTicketPage() {
  const router = useRouter();
  const { isLoaded, user, role, ready } = useAppRole();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ticket, setTicket] = useState<TicketItem | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) {
        return;
      }
      if (role === 'admin') {
        setLoading(false);
        return;
      }
      try {
        const data = await apiService.getMyTickets(user.id);
        setBalance(data.balance);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isLoaded, role, user]);

  useEffect(() => {
    if (ready && role === 'admin') {
      router.replace('/admin');
    }
  }, [ready, role, router]);

  const generateTicket = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.bookTickets(user.id, 1);
      const created = response.tickets[0];
      setTicket(created);
      setBalance(response.balance);
      addActivity({ title: 'Ticket Purchased', subtitle: created.ticketId, amount: -BUS_FARE });
      toast.success('Ticket generated');
    } catch {
      toast.error('Unable to generate ticket');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !ready || loading) {
    return <PageShell />;
  }

  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Generate Ticket</h1>
        <p className="mt-1 text-sm text-zinc-600">Fare {formatCurrency(BUS_FARE)}</p>
        <div className="mt-3">
          <WalletCard balance={balance} />
        </div>
        <ActionButton className="mt-3 w-full" disabled={saving} onClick={() => void generateTicket()}>
          {saving ? 'Generating...' : 'Generate Ticket'}
        </ActionButton>
      </section>

      {ticket ? (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} />
            <p className="font-semibold">Ticket Generated Successfully</p>
          </div>
          <p className="mt-1 text-sm">Your fare has been deducted.</p>
          <Link
            href={`/tickets/${ticket.ticketId}`}
            className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            View QR Ticket
          </Link>
        </motion.section>
      ) : null}
    </PageShell>
  );
}
