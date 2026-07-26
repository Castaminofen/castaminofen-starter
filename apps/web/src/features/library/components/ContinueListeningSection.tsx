'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePlayerRuntime } from '@/features/player/hooks/usePlayerRuntime';
import { usePlayerState } from '@/features/player/hooks/usePlayerState';
import { useUpdateListeningHistory } from '../hooks/useUpdateListeningHistory';
import type { LibraryListeningHistoryItem } from '../types';
import { LibraryEpisodeRow } from './LibraryEpisodeRow';
import { LibraryEmptyState } from './LibraryEmptyState';

export function ContinueListeningSection({ items }: { items: LibraryListeningHistoryItem[] }) {
  const playerRuntime = usePlayerRuntime();
  const playerState = usePlayerState();
  const updateListeningHistory = useUpdateListeningHistory();
  const lastSyncedProgressRef = useRef<{ episodeId: string; position: number } | null>(null);

  const syncListeningHistory = useCallback((episodeId: string, positionSeconds: number, completed: boolean) => {
    const previous = lastSyncedProgressRef.current;
    if (previous?.episodeId === episodeId && previous.position === positionSeconds) {
      return;
    }

    lastSyncedProgressRef.current = { episodeId, position: positionSeconds };
    updateListeningHistory.mutate({
      episodeId,
      positionSeconds,
      completed,
    });
  }, [updateListeningHistory]);

  useEffect(() => {
    const activeItem = playerState.currentItem;
    const activeItemId = items.find((item) => item.episode.id === activeItem?.id);

    if (!activeItem || !activeItemId) {
      return;
    }

    if (activeItem.sourceType !== 'library' && activeItem.sourceType !== 'episode') {
      return;
    }

    if (playerState.playbackStatus !== 'playing' && playerState.playbackStatus !== 'paused') {
      return;
    }

    const positionSeconds = Math.max(0, Math.floor(playerState.currentPosition));
    const completed = playerState.duration > 0 && positionSeconds >= Math.max(0, Math.floor(playerState.duration - 2));
    syncListeningHistory(activeItemId.episode.id, positionSeconds, completed);
  }, [items, playerState.currentItem, playerState.currentPosition, playerState.duration, playerState.playbackStatus, syncListeningHistory]);

  if (!items.length) {
    return <LibraryEmptyState title="هنوز اپیزودی برای ادامه پخش ندارید" description="اپیزودهایی که در حال گوش دادن به آن‌ها هستید در این بخش نمایش داده می‌شوند." />;
  }

  return (
    <section className="rounded-2xl border border-border bg-surface-secondary/70 p-4 sm:p-5" aria-labelledby="continue-listening-heading">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 id="continue-listening-heading" className="text-subheading">ادامه پخش</h2>
          <p className="m-0 text-sm text-text-secondary">اپیزودهایی که اخیراً باز کرده‌اید در این بخش سریع دسترس‌پذیرند.</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-border bg-surface-primary px-3 py-1.5 text-sm text-text-secondary">
          {items.length} مورد
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <LibraryEpisodeRow
            key={item.id}
            episode={item.episode}
            isPlaying={playerState.currentItem?.id === item.episode.id}
            onResume={() => {
              const startTime = Number.isFinite(item.positionSeconds ?? 0) ? Math.max(0, item.positionSeconds ?? 0) : 0;
              syncListeningHistory(item.episode.id, startTime, false);

              void playerRuntime.loadItem(
                {
                  id: item.episode.id,
                  title: item.episode.title,
                  subtitle: item.episode.description,
                  audioUrl: item.episode.audioUrl,
                  artworkUrl: undefined,
                  duration: undefined,
                  podcastId: item.episode.podcast?.id,
                  sourceType: 'library',
                },
                { startTime },
              );
            }}
          />
        ))}
      </div>
    </section>
  );
}
