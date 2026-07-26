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
      title={title}
      description={description}
      action={
        <Link href="/podcasts">
          <Button variant="primary" size="sm">
            {actionLabel}
          </Button>
        </Link>
      }
    />
  );
}
