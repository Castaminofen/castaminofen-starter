'use client';

import { useContinueListening } from '../hooks/useContinueListening';
import { useLibraryOverview } from '../hooks/useLibraryOverview';
import { useLibrarySubscriptions } from '../hooks/useLibrarySubscriptions';
import { ContinueListeningSection } from './ContinueListeningSection';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryErrorState } from './LibraryErrorState';
import { LibraryLoadingState } from './LibraryLoadingState';
import { SubscriptionsSection } from './SubscriptionsSection';

export function LibraryPage() {
  const overviewQuery = useLibraryOverview();
  const subscriptionsQuery = useLibrarySubscriptions();
  const continueListeningQuery = useContinueListening();

  const isLoading = overviewQuery.isLoading || subscriptionsQuery.isLoading || continueListeningQuery.isLoading;
  const isError = overviewQuery.isError || subscriptionsQuery.isError || continueListeningQuery.isError;

  const subscriptions = subscriptionsQuery.data ?? [];
  const continueListening = continueListeningQuery.data ?? [];

  if (isLoading) {
    return <LibraryLoadingState />;
  }

  if (isError) {
    return <LibraryErrorState onRetry={() => { overviewQuery.refetch(); subscriptionsQuery.refetch(); continueListeningQuery.refetch(); }} />;
  }

  if (!subscriptions.length && !continueListening.length) {
    return (
      <div className="space-y-6">
        <LibraryEmptyState title="کتابخانه شما خالی است" description="پادکست‌ها و اپیزودهای در حال دنبال کردن شما در اینجا نمایش داده می‌شوند." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-heading">کتابخانه</h1>
        <p className="text-body m-0 text-text-secondary">پادکست‌های دنبال‌شده و اپیزودهای در حال ادامه پخش خود را مدیریت کنید.</p>
      </div>
      <div className="space-y-6">
        <ContinueListeningSection items={continueListening} />
        <SubscriptionsSection items={subscriptions} />
      </div>
    </div>
  );
}
