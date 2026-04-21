'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import TicketCard from '@/components/TicketCard';
import { apiService, TicketItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

function ticketViewStatus(ticket: TicketItem): 'ACTIVE' | 'USED' | 'EXPIRED' {
  if (ticket.status === 'USED') {
    return 'USED';
  }
  const twelveHours = 12 * 60 * 60 * 1000;
  return Date.now() - +new Date(ticket.createdAt) > twelveHours ? 'EXPIRED' : 'ACTIVE';
}

export default function TicketsPage() {
  const router = useRouter();
  const { isLoaded, user, role, ready } = useAppRole();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        setTickets(data.tickets);
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

  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">My Tickets</h1>
      </section>

      <section className="space-y-3">
        {!ready || loading ? (
          <p className="text-sm text-zinc-500">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-sm">
            No tickets found.
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.ticketId} ticket={ticket} status={ticketViewStatus(ticket)} />
          ))
        )}
      </section>
    </PageShell>
  );
}
