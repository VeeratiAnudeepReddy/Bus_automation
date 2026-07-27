'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import PageShell from '@/components/PageShell';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { navForRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';
import { apiService } from '@/lib/api';

const searchItems = [
  ['Users', '/organization/users'],
  ['Routes', '/admin/fares'],
  ['Buses', '/buses'],
  ['Drivers', '/drivers'],
  ['Conductors', '/conductors'],
  ['Schedules', '/schedules'],
  ['Organizations', '/organization'],
  ['Tickets', '/tickets'],
  ['Bookings', '/bookings'],
  ['Reports', '/reports'],
  ['Pricing', '/pricing'],
  ['Payments', '/payments'],
  ['Support', '/support']
];

export function SearchPageContent() {
  const [query, setQuery] = useState('');
  const { user, getToken } = useAppRole();
  const [groups, setGroups] = useState<{ type: string; items: Record<string, unknown>[] }[]>([]);
  const results = useMemo(
    () => searchItems.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  async function runSearch(value: string) {
    setQuery(value);
    if (!user || value.trim().length < 2) {
      setGroups([]);
      return;
    }
    const token = await getToken();
    if (!token) return;
    setGroups((await apiService.globalSearch(token, value)).groups);
  }
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Global Search" description="Find users, routes, fleet records, tickets, bookings, reports, and settings." />
      <SearchBar value={query} onChange={(value) => void runSearch(value)} placeholder="Search the platform..." />
      {groups.length ? (
        <section className="grid gap-3">
          {groups.map((group) => (
            <div key={group.type} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold uppercase text-zinc-500">{group.type}</h2>
              <div className="mt-3 grid gap-2">
                {group.items.map((item, index) => (
                  <Link key={index} href={resultHref(group.type, item)} className="rounded-xl border border-zinc-200 p-3 text-sm hover:bg-zinc-50">
                    <p className="font-medium text-zinc-900">{resultTitle(group.type, item)}</p>
                    <p className="text-xs text-zinc-500">{resultHref(group.type, item)}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}
      <section className="grid gap-2 md:grid-cols-2">
        {results.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <p className="font-medium text-zinc-900">{label}</p>
            <p className="text-xs text-zinc-500">{href}</p>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}

function resultHref(type: string, item: Record<string, unknown>) {
  const id = String(item._id || '');
  if (type === 'users') return `/organization/users/${id}`;
  if (type === 'tickets') return `/tickets/${String(item.ticketId || id)}`;
  if (type === 'posts') return `/posts/${id}`;
  if (type === 'support') return `/support/${id}`;
  if (type === 'payments') return `/payments/${id}`;
  if (type === 'routes') return '/admin/fares';
  if (type === 'buses') return '/buses';
  if (type === 'schedules') return '/schedules';
  return '/search';
}

function resultTitle(type: string, item: Record<string, unknown>) {
  if (type === 'users') return String(item.name || item.email || 'User');
  if (type === 'routes') return `${String(item.from || 'Route')} -> ${String(item.to || '')}`;
  if (type === 'buses') return String(item.busNumber || item.registrationNumber || 'Bus');
  if (type === 'tickets') return String(item.ticketId || item.bookingId || 'Ticket');
  if (type === 'payments') return String(item.razorpayOrderId || 'Payment');
  if (type === 'posts') return String(item.title || 'Post');
  if (type === 'support') return String(item.ticketNumber || item.title || 'Support');
  if (type === 'schedules') return String(item.tripNumber || 'Schedule');
  return 'Result';
}

export function ProfilePageContent() {
  const { appUser, role } = useAppRole();
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Profile" description="Personal identity, organization, preferences, password, and sessions." />
      <section className="grid gap-3 md:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto h-20 w-20 rounded-full bg-zinc-200" />
          <h1 className="mt-3 text-lg font-semibold text-zinc-900">{appUser?.name || 'User'}</h1>
          <p className="text-sm text-zinc-500">{appUser?.email}</p>
          <p className="mt-2 rounded-full bg-zinc-100 px-3 py-1 text-xs">{role}</p>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {[
            ['Phone', appUser?.phone],
            ['Department', appUser?.department],
            ['Employee ID', appUser?.employeeId],
            ['Designation', appUser?.designation],
            ['Organization', appUser?.organizationId],
            ['Language', appUser?.language],
            ['Timezone', appUser?.timezone],
            ['Theme', appUser?.preferences?.theme || 'system']
          ].map(([label, value]) => (
            <MetricCard key={label || ''} label={String(label)} value={String(value || 'Not set')} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function SettingsPageContent() {
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Settings" description="Organization, personal, appearance, notifications, security, API keys, branding, GST, working hours, and support." />
      <section className="grid gap-3 md:grid-cols-3">
        {[
          ['Organization Settings', '/organization'],
          ['Personal Settings', '/profile'],
          ['Appearance', '/complete-profile'],
          ['Notifications', '/notifications'],
          ['Security & Sessions', '/profile'],
          ['API Keys', '/settings'],
          ['Branding', '/organization'],
          ['Working Hours', '/organization'],
          ['GST', '/organization'],
          ['Support', '/support']
        ].map(([label, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">{label}</Link>
        ))}
      </section>
    </PageShell>
  );
}

export function HelpPageContent() {
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Help Center" description="FAQ, documentation, videos, support, and contact options." />
      <section className="grid gap-3 md:grid-cols-2">
        {['Getting Started', 'Invite Employees', 'Create Routes', 'Configure Pricing', 'Payments & Refunds', 'Contact Support'].map((item) => (
          <div key={item} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-zinc-900">{item}</h2>
            <p className="mt-1 text-sm text-zinc-600">Step-by-step guidance for {item.toLowerCase()}.</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}

export function OnboardingPageContent() {
  const steps = [
    ['Organization', '/organization'],
    ['Invite Employees', '/organization/users'],
    ['Create Routes', '/admin/fares'],
    ['Add Bus', '/buses'],
    ['Add Driver', '/drivers'],
    ['Add Conductor', '/conductors'],
    ['Pricing', '/pricing'],
    ['Launch workspace', '/dashboard']
  ];
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Guided Onboarding" description="Finish the operational setup path for your organization." />
      <section className="grid gap-3 md:grid-cols-2">
        {steps.map(([label, href], index) => (
          <Link key={label} href={href} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500">Step {index + 1}</p>
            <h2 className="mt-1 font-semibold text-zinc-900">{label}</h2>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}

export function ForbiddenPageContent() {
  const { role } = useAppRole();
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Access denied" description="Your current role cannot open this page." actions={[{ href: '/dashboard', label: 'Return Home' }, { href: '/support', label: 'Contact Admin' }]} />
      <EmptyState title="403" description={`Signed in as ${role || 'guest'}. Ask an administrator for access if this looks wrong.`} />
    </PageShell>
  );
}

export function NotFoundPageContent() {
  const { role } = useAppRole();
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Page not found" description="Search the platform, return to your dashboard, or go back." actions={[{ href: '/search', label: 'Search' }, { href: navForRole(role)[0]?.href || '/dashboard', label: 'Dashboard' }]} />
      <EmptyState title="404" description="That page does not exist or has moved." />
    </PageShell>
  );
}
