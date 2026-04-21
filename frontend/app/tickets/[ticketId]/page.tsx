'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import QRCard from '@/components/QRCard';
import { apiService, TicketItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

function ticketViewStatus(ticket: TicketItem): 'ACTIVE' | 'USED' | 'EXPIRED' {
  if (ticket.status === 'USED') {
    return 'USED';
  }
  const twelveHours = 12 * 60 * 60 * 1000;
  return Date.now() - +new Date(ticket.createdAt) > twelveHours ? 'EXPIRED' : 'ACTIVE';
}

export default function TicketDetailsPage() {
  const params = useParams<{ ticketId: string }>();
  const router = useRouter();
  const { isLoaded, user, role, ready } = useAppRole();
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [passengerName, setPassengerName] = useState('Passenger');

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) {
        return;
      }
      if (role === 'admin') {
        return;
      }
      try {
        const [myTickets, appUser] = await Promise.all([
          apiService.getMyTickets(user.id),
          apiService.syncUser({
            clerkUserId: user.id,
            name: user.fullName || 'Bus User',
            email: user.primaryEmailAddress?.emailAddress || '',
            phone: user.primaryPhoneNumber?.phoneNumber
          })
        ]);
        setTicket(myTickets.tickets.find((item) => item.ticketId === params.ticketId) || null);
        setPassengerName(appUser.name);
      } catch {
        toast.error('Unable to load ticket');
      }
    };

    void load();
  }, [isLoaded, params.ticketId, role, user]);

  useEffect(() => {
    if (ready && role === 'admin') {
      router.replace('/admin');
    }
  }, [ready, role, router]);

  const status = useMemo(() => (ticket ? ticketViewStatus(ticket) : 'ACTIVE'), [ticket]);

  const download = () => {
    if (!ticket) {
      return;
    }
    const link = document.createElement('a');
    link.href = ticket.qr;
    link.download = `${ticket.ticketId}.png`;
    link.click();
  };

  const share = async () => {
    if (!ticket) {
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'BusQR Ticket',
          text: `Ticket: ${ticket.ticketId}`
        });
      } else {
        await navigator.clipboard.writeText(ticket.ticketId);
        toast.success('Ticket ID copied');
      }
    } catch {
      toast.error('Share failed');
    }
  };

  return (
    <PageShell>
      {ticket ? (
        <>
          <QRCard ticket={ticket} passengerName={passengerName} status={status} />
          <div className="grid grid-cols-2 gap-3">
            <ActionButton variant="outline" onClick={download}>
              Download
            </ActionButton>
            <ActionButton onClick={() => void share()}>Share</ActionButton>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-sm">
          Ticket not found.
        </div>
      )}
    </PageShell>
  );
}
