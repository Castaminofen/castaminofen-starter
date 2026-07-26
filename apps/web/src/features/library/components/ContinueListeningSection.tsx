'use client';

import { usePlayerRuntime } from '@/features/player/hooks/usePlayerRuntime';
import { usePlayerState } from '@/features/player/hooks/usePlayerState';
import type { LibraryListeningHistoryItem } from '../types';
import { LibraryEpisodeRow } from './LibraryEpisodeRow';
import { LibraryEmptyState } from './LibraryEmptyState';

export function ContinueListeningSection({ items }: { items: LibraryListeningHistoryItem[] }) {
  const playerRuntime = usePlayerRuntime();
  const playerState = usePlayerState();

  if (!items.length) {
    return <LibraryEmptyState title="هنوز اپیزودی برای ادامه پخش ندارید" description="اپیزودهایی که در حال گوش دادن به آن‌ها هستید در این بخش نمایش داده می‌شوند." />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-subheading">ادامه پخش</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <LibraryEpisodeRow
            key={item.id}
            episode={item.episode}
            isPlaying={playerState.currentItem?.id === item.episode.id}
            onResume={() => {
              void playerRuntime.loadItem({
                id: item.episode.id,
                title: item.episode.title,
                subtitle: item.episode.description,
                audioUrl: item.episode.audioUrl,
                artworkUrl: undefined,
                duration: undefined,
                sourceType: 'library',
              });
            }}
          />
        ))}
      </div>
    </section>
  );
}
