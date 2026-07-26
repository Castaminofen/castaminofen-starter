import type { Episode, Podcast } from '@/lib/types';

export interface Playlist {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  itemCount?: number;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  episodeId: string;
  position: number;
  episode: Episode & {
    podcast?: Podcast | null;
  };
}

export interface PlaylistDetail extends Playlist {
  items: PlaylistItem[];
  itemCount: number;
}

export interface PlaylistFormValues {
  title: string;
  description: string;
  imageUrl: string;
  isPublic: boolean;
}
