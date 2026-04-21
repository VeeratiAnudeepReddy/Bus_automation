'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, QrCode, Wallet } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tickets', label: 'Tickets', icon: QrCode },
  { href: '/wallet', label: 'Wallet', icon: Wallet }
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-zinc-200 bg-white">
      <div className="grid grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2 text-xs ${
                active ? 'text-black' : 'text-zinc-500'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
