'use client';

import Link from 'next/link';
import { Search, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="app-header sticky top-0 z-30 border-b border-border bg-surface-secondary/95 backdrop-blur-xl">
      <div className="mobile-container flex items-center justify-between gap-3 px-3 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-caption uppercase tracking-[0.24em] text-text-secondary">Castaminofen</p>
          <h1 className="text-heading">پخش و کشف صوتی</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search" className="icon-button" aria-label="جستجو در پادکست‌ها">
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="/profile" className="icon-button" aria-label="تنظیمات کاربری">
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
