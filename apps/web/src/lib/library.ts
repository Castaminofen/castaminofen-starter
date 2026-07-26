import { apiFetch } from './api';
import type { Episode, Podcast } from '@/lib/types';

export type LibrarySubscriptionResponse = {
  id: string;
  userId: string;
  podcastId: string;
  subscribedAt: string;
  podcast: Podcast;
};

export type LibraryContinueListeningResponse = {
  id: string;
  userId: string;
  episodeId: string;
  positionSeconds: number | null;
  completed: boolean;
  lastPlayedAt: string;
  episode: Episode & { podcast?: Podcast | null };
};

export type LibraryOverviewResponse = {
  subscriptions: LibrarySubscriptionResponse[];
  continueListening: LibraryContinueListeningResponse[];
};

export async function getLibraryOverview(): Promise<LibraryOverviewResponse> {
  return apiFetch<LibraryOverviewResponse>('library');
}

export async function getLibrarySubscriptions(): Promise<LibrarySubscriptionResponse[]> {
  return apiFetch<LibrarySubscriptionResponse[]>('library/subscriptions');
}

export async function subscribeToPodcast(podcastId: string): Promise<LibrarySubscriptionResponse> {
  return apiFetch<LibrarySubscriptionResponse>(`library/subscriptions/${podcastId}`, {
    method: 'POST',
  });
}

export async function unsubscribeFromPodcast(podcastId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`library/subscriptions/${podcastId}`, {
    method: 'DELETE',
  });
}

export async function getContinueListening(): Promise<LibraryContinueListeningResponse[]> {
  return apiFetch<LibraryContinueListeningResponse[]>('library/continue-listening');
}

export async function updateListeningHistory(variables: { episodeId: string; positionSeconds?: number; completed?: boolean }) {
  return apiFetch<LibraryContinueListeningResponse>(`library/history/${variables.episodeId}`, {
    method: 'PATCH',
    body: {
      positionSeconds: variables.positionSeconds,
      completed: variables.completed,
    },
  });
}
