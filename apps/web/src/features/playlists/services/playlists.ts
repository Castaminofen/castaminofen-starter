import { apiFetch } from '@/lib/api';
import type { Playlist, PlaylistDetail, PlaylistFormValues } from '../types';

export async function getPlaylists(): Promise<Playlist[]> {
  return apiFetch<Playlist[]>('playlists');
}

export async function getPlaylistById(id: string): Promise<PlaylistDetail> {
  return apiFetch<PlaylistDetail>(`playlists/${id}`);
}

export async function createPlaylist(payload: PlaylistFormValues): Promise<Playlist> {
  return apiFetch<Playlist>('playlists', {
    method: 'POST',
    body: payload,
  });
}

export async function updatePlaylist(id: string, payload: Partial<PlaylistFormValues>): Promise<Playlist> {
  return apiFetch<Playlist>(`playlists/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deletePlaylist(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`playlists/${id}`, {
    method: 'DELETE',
  });
}

export async function addPlaylistItem(playlistId: string, episodeId: string) {
  return apiFetch<{ id: string; playlistId: string; episodeId: string; position: number }>(`playlists/${playlistId}/items`, {
    method: 'POST',
    body: { episodeId },
  });
}

export async function removePlaylistItem(playlistId: string, episodeId: string) {
  return apiFetch<{ success: boolean }>(`playlists/${playlistId}/items/${episodeId}`, {
    method: 'DELETE',
  });
}

export async function reorderPlaylistItems(playlistId: string, items: Array<{ episodeId: string; position: number }>) {
  return apiFetch<PlaylistDetail>(`playlists/${playlistId}/items/reorder`, {
    method: 'PATCH',
    body: { items },
  });
}
