import { formatCurrency } from '@/lib/format';

export default function WalletCard({ balance }: { balance: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">Wallet Balance</p>
      <p className="mt-1 text-3xl font-semibold text-zinc-900">{formatCurrency(balance)}</p>
    </div>
  );
}

