'use client';

import { useLibraryOverview } from '../hooks/useLibraryOverview';
import { ContinueListeningSection } from './ContinueListeningSection';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryErrorState } from './LibraryErrorState';
import { LibraryLoadingState } from './LibraryLoadingState';
import { SubscriptionsSection } from './SubscriptionsSection';

export function LibraryPage() {
  const overviewQuery = useLibraryOverview();

  const isLoading = overviewQuery.isLoading;
  const isError = overviewQuery.isError;

  const subscriptions = overviewQuery.data?.subscriptions ?? [];
  const continueListening = overviewQuery.data?.continueListening ?? [];
  const hasAnyContent = subscriptions.length > 0 || continueListening.length > 0;

  if (isLoading) {
    return <LibraryLoadingState />;
  }

  if (isError && !hasAnyContent) {
    return <LibraryErrorState onRetry={() => { void overviewQuery.refetch(); }} />;
  }

  if (!hasAnyContent) {
    return (
      <div className="space-y-6">
        <LibraryEmptyState title="کتابخانه شما خالی است" description="پادکست‌ها و اپیزودهای در حال دنبال کردن شما در اینجا نمایش داده می‌شوند." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-heading">کتابخانه</h1>
            <p className="text-body m-0 max-w-2xl">پادکست‌های دنبال‌شده و اپیزودهای در حال ادامه پخش خود را در یک نمای مرتب مدیریت کنید.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            {continueListening.length > 0 ? (
              <span className="inline-flex items-center rounded-full border border-border bg-surface-primary px-3 py-1.5">{continueListening.length} اپیزود در ادامه پخش</span>
            ) : null}
            {subscriptions.length > 0 ? (
              <span className="inline-flex items-center rounded-full border border-border bg-surface-primary px-3 py-1.5">{subscriptions.length} اشتراک فعال</span>
            ) : null}
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-warning/40 bg-surface-secondary/70 p-3 sm:p-4">
          <LibraryErrorState onRetry={() => { void overviewQuery.refetch(); }} />
        </div>
      ) : null}

      <div className="space-y-4 sm:space-y-6">
        <ContinueListeningSection items={continueListening} />
        <SubscriptionsSection items={subscriptions} />
      </div>
    </div>
  );
}
