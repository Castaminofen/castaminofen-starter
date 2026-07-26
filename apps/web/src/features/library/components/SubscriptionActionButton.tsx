'use client';

import { Button } from '@/components/ui/button';

export function SubscriptionActionButton({
  isSubscribed,
  onSubscribe,
  onUnsubscribe,
}: {
  isSubscribed: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}) {
  return (
    <Button variant={isSubscribed ? 'secondary' : 'primary'} size="sm" onClick={isSubscribed ? onUnsubscribe : onSubscribe}>
      {isSubscribed ? 'لغو اشتراک' : 'اشتراک'}
    </Button>
  );
}
