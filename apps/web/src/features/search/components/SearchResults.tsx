"use client";

import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PodcastCard } from '@/features/podcasts/PodcastCard';
import { useSearch } from '../hooks/useSearch';

export default function SearchResults({ q, page }: { q: string; page: number }) {
  const limit = 12;
  const query = useSearch({ q: q || undefined, page, limit });

  const totalPages = query.data?.pagination.totalPages ?? 1;

  if (query.isLoading) return <LoadingState title="در حال جستجو" message="در حال بررسی نتایج برای عبارت موردنظر هستیم…" />;
  if (query.isError) return <ErrorState title="جستجو با مشکل مواجه شد" message={query.error?.message ?? 'امکان انجام جستجو در این لحظه وجود ندارد.'} description="لطفاً دوباره تلاش کنید." />;

  const items = query.data?.data ?? [];

  if (!items.length) {
    return <EmptyState title="نتیجه‌ای یافت نشد" description={`برای «${q || 'جستجوی شما'}» هیچ پادکستی پیدا نشد. از عبارت دیگری استفاده کنید.`} />;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            className="button button-secondary"
            onClick={() => {
              const prev = Math.max(1, page - 1);
              window.location.href = `/search?q=${encodeURIComponent(q)}&page=${prev}`;
            }}
            disabled={page === 1}
          >
            قبلی
          </button>

          <span className="rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-sm text-text-secondary">
            {page} / {totalPages}
          </span>

          <button
            className="button button-secondary"
            onClick={() => {
              const next = Math.min(totalPages, page + 1);
              window.location.href = `/search?q=${encodeURIComponent(q)}&page=${next}`;
            }}
            disabled={page === totalPages}
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}
