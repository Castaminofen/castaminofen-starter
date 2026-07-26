import type { Episode, Podcast } from '@/lib/types';

export type LibrarySubscription = {
  id: string;
  userId: string;
  podcastId: string;
  subscribedAt: string;
  podcast: Podcast;
};

export type LibraryListeningHistoryItem = {
  id: string;
  userId: string;
  episodeId: string;
  positionSeconds: number | null;
  completed: boolean;
  lastPlayedAt: string;
  episode: Episode & { podcast?: Podcast | null };
};

export type LibraryOverviewResponse = {
  subscriptions: LibrarySubscription[];
  continueListening: LibraryListeningHistoryItem[];
};

export type LibrarySectionViewMode = 'list' | 'grid';
