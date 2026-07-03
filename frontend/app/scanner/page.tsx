import PageShell from '@/components/PageShell';
import Link from 'next/link';

export default function ScannerPage() {
  return (
    <PageShell>
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Scanner</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Ticket scanner moved to conductor workspace</h1>
        <p className="mt-2 text-sm text-zinc-600">Open the scanner from the conductor dashboard when your role has scanner access.</p>
        <Link href="/conductor" className="mt-4 inline-flex rounded-xl bg-black px-4 py-3 text-sm font-medium text-white">
          Open conductor dashboard
        </Link>
      </section>
    </PageShell>
  );
}
