'use client';

import { Button } from '@/components/ui/button';
import type { Episode } from '@/lib/types';

export function LibraryEpisodeRow({
  episode,
  onResume,
  isPlaying,
}: {
  episode: Episode;
  onResume: () => void;
  isPlaying: boolean;
}) {
  const artworkInitial = episode.title.trim().charAt(0) || 'پ';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-primary/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent/5 text-sm font-semibold text-accent">
          {artworkInitial}
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-medium text-text-primary">{episode.title}</h3>
          <p className="m-0 text-sm text-text-secondary">{episode.description || 'بدون توضیح'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span className="inline-flex items-center rounded-full border border-border bg-surface-secondary px-2.5 py-1 text-xs text-text-secondary">
          {isPlaying ? 'در حال پخش' : 'آماده برای ادامه'}
        </span>
        <Button variant="secondary" size="sm" onClick={onResume} aria-label={`ادامه پخش ${episode.title}`}>
          {isPlaying ? 'ادامه پخش' : 'ادامه'}
        </Button>
      </div>
    </div>
  );
}
