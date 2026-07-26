'use client';

import { useSubscribePodcast } from '../hooks/useSubscribePodcast';
import { useUnsubscribePodcast } from '../hooks/useUnsubscribePodcast';
import type { LibrarySubscription } from '../types';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryPodcastCard } from './LibraryPodcastCard';

export function SubscriptionsSection({ items }: { items: LibrarySubscription[] }) {
  const subscribeMutation = useSubscribePodcast();
  const unsubscribeMutation = useUnsubscribePodcast();

  if (!items.length) {
    return <LibraryEmptyState title="هنوز پادکستی را دنبال نمی‌کنید" description="پادکست‌هایی که در کتابخانه خود دارید در این بخش نمایش داده می‌شوند." />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-subheading">اشتراک‌ها</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <LibraryPodcastCard
            key={item.id}
            podcast={item.podcast}
            isSubscribed
            onSubscribe={() => subscribeMutation.mutate(item.podcast.id)}
            onUnsubscribe={() => unsubscribeMutation.mutate(item.podcast.id)}
          />
        ))}
      </div>
    </section>
  );
}
