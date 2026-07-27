'use client';

import Link from 'next/link';
import { Bell, Menu, UserRound } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { navForRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';

export default function Navbar() {
  const { user } = useUser();
  const { role } = useAppRole();
  const nav = navForRole(role).slice(0, 3);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-zinc-900">
          BusQR
        </Link>
        <div className="flex items-center gap-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hidden rounded-full border border-zinc-200 px-3 py-2 text-xs text-zinc-700 sm:inline-flex">
              {item.label}
            </Link>
          ))}
          <button className="rounded-full border border-zinc-200 p-2 text-zinc-700">
            <Bell size={18} />
          </button>
          <Link href={nav[0]?.href || '/register'} className="rounded-full border border-zinc-200 p-2 text-zinc-700" title="Menu">
            <Menu size={18} />
          </Link>
          {user ? (
            <UserButton />
          ) : (
            <div className="rounded-full border border-zinc-200 p-2 text-zinc-700">
              <UserRound size={18} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
