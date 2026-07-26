import { mapEpisodeToPlayableItem } from '../../player/adapters/episodeToPlayable';
import type { PlaylistItem } from '../types';

export interface PlaylistPlaybackPlan {
  queue: ReturnType<typeof mapEpisodeToPlayableItem>[];
  startIndex: number;
}

export function buildPlaylistPlaybackPlan(items: PlaylistItem[], selectedEpisodeId?: string): PlaylistPlaybackPlan {
  const orderedItems = [...items].sort((a, b) => a.position - b.position);
  const playableItems = orderedItems.map((item) => mapEpisodeToPlayableItem(item.episode));

  const selectedIndex = selectedEpisodeId
    ? playableItems.findIndex((item) => item.id === selectedEpisodeId)
    : 0;

  const effectiveIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return {
    queue: playableItems.slice(effectiveIndex),
    startIndex: 0,
  };
}
