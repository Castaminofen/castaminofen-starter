'use client';

import Link from 'next/link';
import type { Podcast } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { SubscriptionActionButton } from './SubscriptionActionButton';

export function LibraryPodcastCard({
  podcast,
  isSubscribed,
  onSubscribe,
  onUnsubscribe,
}: {
  podcast: Podcast;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}) {
  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-subheading">{podcast.title}</h3>
        <p className="text-body m-0 text-sm text-text-secondary">{podcast.description || 'بدون توضیح'}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Link href={`/podcasts/${podcast.id}`} className="text-sm font-medium text-accent">
          مشاهده پادکست
        </Link>
        <SubscriptionActionButton isSubscribed={isSubscribed} onSubscribe={onSubscribe} onUnsubscribe={onUnsubscribe} />
      </div>
    </Card>
  );
}
