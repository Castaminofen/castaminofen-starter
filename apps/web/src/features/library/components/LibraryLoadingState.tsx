'use client';

import { LoadingState } from '@/components/ui/loading-state';

export function LibraryLoadingState() {
  return <LoadingState title="در حال بارگذاری کتابخانه" message="در حال آماده‌سازی بخش‌های کتابخانه…" className="py-4" />;
}
