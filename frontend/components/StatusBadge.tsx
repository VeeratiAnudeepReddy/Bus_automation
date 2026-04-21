type TicketStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'VALID' | 'INVALID' | 'REJECT';

const statusMap: Record<TicketStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  USED: 'bg-zinc-200 text-zinc-700',
  EXPIRED: 'bg-red-100 text-red-700',
  VALID: 'bg-emerald-100 text-emerald-700',
  INVALID: 'bg-red-100 text-red-700',
  REJECT: 'bg-zinc-900 text-white'
};

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMap[status]}`}>
      {status}
    </span>
  );
}
