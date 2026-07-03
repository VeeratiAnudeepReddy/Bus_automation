'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Circle } from 'lucide-react';
import { navForRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';

export default function BottomTabBar() {
  const pathname = usePathname();
  const { role } = useAppRole();
  const tabs = navForRole(role).slice(0, 4);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-zinc-200 bg-white">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2 text-xs ${
                active ? 'text-black' : 'text-zinc-500'
              }`}
            >
              <Circle size={12} fill="currentColor" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
