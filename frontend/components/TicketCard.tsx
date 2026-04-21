import Link from 'next/link';
import { TicketItem } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import StatusBadge from './StatusBadge';

type Props = {
  ticket: TicketItem;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
};

export default function TicketCard({ ticket, status }: Props) {
  return (
    <Link
      href={`/tickets/${ticket.ticketId}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
    >
      <div className="flex items-center justify-between">
        <p className="max-w-[70%] truncate text-sm font-medium text-zinc-900" title={ticket.ticketId}>
          {ticket.ticketId}
        </p>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">{formatDateTime(ticket.createdAt)}</p>
    </Link>
  );
}
