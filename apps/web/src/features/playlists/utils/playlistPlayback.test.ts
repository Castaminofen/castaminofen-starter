import { describe, expect, it } from 'vitest';
import type { PlaylistItem } from '../types';
import { buildPlaylistPlaybackPlan } from './playlistPlayback';

function createPlaylistItem(id: string, episodeId: string): PlaylistItem {
  return {
    id,
    playlistId: 'playlist-1',
    episodeId,
    position: 0,
    episode: {
      id: episodeId,
      title: `Episode ${episodeId}`,
      description: 'Test episode',
      audioUrl: 'https://example.com/audio.mp3',
      podcastId: 'podcast-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      duration: 300,
      seasonNumber: 1,
      episodeNumber: 1,
      publishedAt: '2024-01-01T00:00:00.000Z',
      podcast: null,
    },
  };
}

describe('buildPlaylistPlaybackPlan', () => {
  it('builds a queue from the playlist and starts from the selected episode', () => {
    const items = [createPlaylistItem('1', 'ep-1'), createPlaylistItem('2', 'ep-2'), createPlaylistItem('3', 'ep-3')];

    const plan = buildPlaylistPlaybackPlan(items, 'ep-2');

    expect(plan.queue.map((item) => item.id)).toEqual(['ep-2', 'ep-3']);
    expect(plan.startIndex).toBe(0);
  });

  it('defaults to the first episode when no selected episode is provided', () => {
    const items = [createPlaylistItem('1', 'ep-1'), createPlaylistItem('2', 'ep-2')];

    const plan = buildPlaylistPlaybackPlan(items);

    expect(plan.queue.map((item) => item.id)).toEqual(['ep-1', 'ep-2']);
    expect(plan.startIndex).toBe(0);
  });
});
