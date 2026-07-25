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

  if (query.isLoading) return <LoadingState message="Loading search results..." />;
  if (query.isError) return <ErrorState message={query.error?.message ?? 'Unable to search'} />;

  const items = query.data?.data ?? [];

  if (!items.length) {
    return <EmptyState title="No results" description={`No podcasts found for “${q || 'your search'}”.`} />;
  }

  return (
    <>
      <div className="field-row">
        {items.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="toolbar" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            className="button button-secondary"
            onClick={() => {
              const prev = Math.max(1, page - 1);
              window.location.href = `/search?q=${encodeURIComponent(q)}&page=${prev}`;
            }}
            disabled={page === 1}
          >
            Previous
          </button>

          <span>
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
            Next
          </button>
        </div>
      ) : null}
    </>
  );
}
