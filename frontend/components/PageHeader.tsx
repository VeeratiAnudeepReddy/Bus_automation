import Link from 'next/link';

export default function PageHeader({
  title,
  description,
  actions = []
}: {
  title: string;
  description?: string;
  actions?: { href: string; label: string }[];
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-zinc-500">
        <Link href="/dashboard">Dashboard</Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-950">{title}</h1>
          {description ? <p className="mt-1 text-sm text-zinc-600">{description}</p> : null}
        </div>
        {actions.length ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link key={action.href} href={action.href} className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white">
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
