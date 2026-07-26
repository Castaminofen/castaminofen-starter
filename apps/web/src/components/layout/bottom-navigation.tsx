'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Layers, User } from 'lucide-react';

const navigationItems = [
  { label: 'خانه', href: '/', icon: Home },
  { label: 'جستجو', href: '/search', icon: Search },
  { label: 'کتابخانه', href: '/library', icon: Layers },
  { label: 'پروفایل', href: '/profile', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-navigation fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface-secondary/95 backdrop-blur-xl" aria-label="منوی اصلی">
      <div className="mx-auto flex max-w-app items-center justify-between gap-2 px-3 py-3 sm:px-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`bottom-navigation__item group flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-2 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary ${isActive ? 'border-accent/30 bg-accent/10 text-accent' : 'border-transparent bg-transparent text-text-secondary hover:border-border hover:bg-surface-primary hover:text-text-primary'}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
