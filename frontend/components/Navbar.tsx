'use client';

import Link from 'next/link';
import { Bell, UserRound } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-zinc-900">
          BusQR
        </Link>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-zinc-200 p-2 text-zinc-700">
            <Bell size={18} />
          </button>
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

