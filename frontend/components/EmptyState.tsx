import Link from 'next/link';

export default function EmptyState({ title, description, actionHref, actionLabel }: { title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100" />
      <h2 className="mt-4 text-base font-semibold text-zinc-900">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
      {actionHref && actionLabel ? <Link href={actionHref} className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">{actionLabel}</Link> : null}
    </div>
  );
}
