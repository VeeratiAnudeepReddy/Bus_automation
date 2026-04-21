import { ScanResult } from '@/lib/api';

type Props = {
  result: ScanResult;
};

export default function ScannerCard({ result }: Props) {
  if (result.result === 'VALID') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        <p className="font-semibold">Ticket Verified</p>
        <p className="text-sm">Passenger: {result.ticket?.passengerName ?? 'Verified Rider'}</p>
        <p className="text-sm">Marked as Used</p>
      </div>
    );
  }

  if (result.result === 'REJECT') {
    return (
      <div className="rounded-2xl border border-zinc-900 bg-zinc-100 p-4 text-zinc-900">
        <p className="font-semibold">Ticket Already Used</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
      <p className="font-semibold">Invalid Ticket</p>
    </div>
  );
}
