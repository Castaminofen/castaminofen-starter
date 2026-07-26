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
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-secondary/70 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-text-primary">{episode.title}</h3>
        <p className="m-0 text-sm text-text-secondary">{episode.description || 'بدون توضیح'}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onResume}>
        {isPlaying ? 'ادامه پخش' : 'ادامه'}
      </Button>
    </div>
  );
}
