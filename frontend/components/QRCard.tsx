import Image from 'next/image';
import { TicketItem } from '@/lib/api';
import { BUS_FARE, formatCurrency, formatDateTime, shortId } from '@/lib/format';
import StatusBadge from './StatusBadge';

type Props = {
  ticket: TicketItem;
  passengerName: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
};

export default function QRCard({ ticket, passengerName, status }: Props) {
  return (
    <div className="rounded-3xl border border-zinc-900 bg-white p-5 shadow-md">
      <div className="space-y-1 text-sm text-zinc-700">
        <p>
          <span className="text-zinc-500">Passenger:</span> {passengerName}
        </p>
        <p>
          <span className="text-zinc-500">User ID:</span> {shortId(ticket.userId)}
        </p>
        <p>
          <span className="text-zinc-500">Ticket ID:</span> {ticket.ticketId}
        </p>
        <p>
          <span className="text-zinc-500">Fare:</span> {formatCurrency(ticket.fare ?? BUS_FARE)}
        </p>
        <p>
          <span className="text-zinc-500">Date & Time:</span> {formatDateTime(ticket.createdAt)}
        </p>
      </div>
      <div className="mt-3">
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <Image
          src={ticket.qr}
          alt={ticket.ticketId}
          width={300}
          height={300}
          className="mx-auto h-64 w-64 rounded-xl"
          unoptimized
        />
      </div>
    </div>
  );
}
