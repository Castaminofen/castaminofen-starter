'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function LibraryEmptyState({
  title,
  description,
  actionLabel = 'مشاهده پادکست‌ها',
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <EmptyState
      className="border border-border/80 bg-surface-primary/70 p-6 sm:p-8"
      title={title}
      description={description}
      action={
        <Link href="/podcasts" className="inline-flex">
          <Button variant="primary" size="sm">
            {actionLabel}
          </Button>
        </Link>
      }
    />
  );
}
