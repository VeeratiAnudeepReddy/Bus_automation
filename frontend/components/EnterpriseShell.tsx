'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, HelpCircle, Search, Settings, UserRound } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { navForRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';

export function EnterpriseSidebar() {
  const pathname = usePathname();
  const { role } = useAppRole();
  const nav = navForRole(role);

  return (
    <aside className="hidden min-h-screen w-64 border-r border-zinc-200 bg-white px-4 py-5 lg:block">
      <Link href="/dashboard" className="block text-xl font-semibold text-zinc-950">BusQR</Link>
      <p className="mt-1 text-xs uppercase text-zinc-500">{role || 'Guest'}</p>
      <nav className="mt-6 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${active ? 'bg-zinc-950 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-zinc-200 pt-4">
        {[
          ['/search', 'Search'],
          ['/notifications', 'Notifications'],
          ['/profile', 'Profile'],
          ['/settings', 'Settings'],
          ['/help', 'Help']
        ].map(([href, label]) => (
          <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100">
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function EnterpriseTopbar() {
  const { user } = useUser();
  const { appUser, role } = useAppRole();
  const pathname = usePathname();
  const crumbs = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <div>
          <Link href="/dashboard" className="text-lg font-semibold text-zinc-950 lg:hidden">BusQR</Link>
          <p className="hidden text-xs uppercase text-zinc-500 lg:block">Workspace</p>
          <p className="hidden text-sm font-medium text-zinc-900 lg:block">
            <Link href="/dashboard">Dashboard</Link>
            {crumbs.map((crumb) => (
              <span key={crumb}> <span className="text-zinc-400">/</span> {decodeURIComponent(crumb)}</span>
            ))}
          </p>
          <p className="hidden text-xs text-zinc-500 lg:block">{appUser?.organizationId || 'Personal workspace'}</p>
        </div>
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <Link href="/search" className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
            <Search size={16} /> Search users, routes, buses, tickets, reports...
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 sm:inline">{role || 'Guest'}</span>
          <Link href="/notifications" className="rounded-full border border-zinc-200 p-2 text-zinc-700"><Bell size={18} /></Link>
          <Link href="/help" className="rounded-full border border-zinc-200 p-2 text-zinc-700"><HelpCircle size={18} /></Link>
          <Link href="/settings" className="rounded-full border border-zinc-200 p-2 text-zinc-700"><Settings size={18} /></Link>
          {user ? <UserButton /> : <Link href="/sign-in" className="rounded-full border border-zinc-200 p-2 text-zinc-700"><UserRound size={18} /></Link>}
        </div>
      </div>
    </header>
  );
}
