'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, Show, UserButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const { isLoaded, user } = useUser();
  const [role, setRole] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      if (!isLoaded || !user) {
        setRole(null);
        return;
      }

      try {
        const appUser = await apiService.syncUser({
          clerkUserId: user.id,
          name: user.fullName || 'Bus User',
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber
        });
        setRole(appUser.role);
      } catch {
        setRole(null);
      }
    };

    void loadRole();
  }, [isLoaded, user]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-orange-600">BusQR</Link>

        <div className="flex items-center gap-2">
          <Show when="signed-in">
            {role === 'admin' ? (
              <NavLink href="/admin" active={pathname === '/admin'}>Admin</NavLink>
            ) : (
              <NavLink href="/dashboard" active={pathname === '/dashboard'}>Dashboard</NavLink>
            )}
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg border border-orange-300 text-orange-700 font-medium">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium ${
        active ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'
      }`}
    >
      {children}
    </Link>
  );
}
