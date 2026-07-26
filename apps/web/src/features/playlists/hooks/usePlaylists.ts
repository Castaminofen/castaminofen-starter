import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPlaylistItem,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  removePlaylistItem,
  reorderPlaylistItems,
  updatePlaylist,
} from '../services/playlists';

const playlistsKey = () => ['playlists'] as const;
const playlistDetailKey = (playlistId?: string) => ['playlist', playlistId] as const;
const playlistItemsKey = (playlistId?: string) => ['playlist', playlistId, 'items'] as const;

export function usePlaylists() {
  return useQuery({
    queryKey: playlistsKey(),
    queryFn: getPlaylists,
    staleTime: 1000 * 30,
  });
}

export function usePlaylist(playlistId?: string) {
  return useQuery({
    queryKey: playlistDetailKey(playlistId),
    queryFn: () => getPlaylistById(playlistId as string),
    enabled: Boolean(playlistId),
    staleTime: 1000 * 30,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: playlistsKey() });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updatePlaylist>[1] }) => updatePlaylist(id, payload),
    onSuccess: (playlist) => {
      void queryClient.invalidateQueries({ queryKey: playlistsKey() });
      void queryClient.setQueryData(playlistDetailKey(playlist.id), playlist);
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deletePlaylist(id),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: playlistsKey() });
      void queryClient.removeQueries({ queryKey: playlistDetailKey(variables.id) });
      void queryClient.removeQueries({ queryKey: playlistItemsKey(variables.id) });
    },
  });
}

export function useAddPlaylistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, episodeId }: { playlistId: string; episodeId: string }) => addPlaylistItem(playlistId, episodeId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: playlistsKey() });
      void queryClient.invalidateQueries({ queryKey: playlistDetailKey(variables.playlistId) });
      void queryClient.invalidateQueries({ queryKey: playlistItemsKey(variables.playlistId) });
    },
  });
}

export function useRemovePlaylistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, episodeId }: { playlistId: string; episodeId: string }) => removePlaylistItem(playlistId, episodeId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: playlistsKey() });
      void queryClient.invalidateQueries({ queryKey: playlistDetailKey(variables.playlistId) });
      void queryClient.invalidateQueries({ queryKey: playlistItemsKey(variables.playlistId) });
    },
  });
}

export function useReorderPlaylistItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, items }: { playlistId: string; items: Array<{ episodeId: string; position: number }> }) => reorderPlaylistItems(playlistId, items),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: playlistsKey() });
      void queryClient.invalidateQueries({ queryKey: playlistDetailKey(variables.playlistId) });
      void queryClient.invalidateQueries({ queryKey: playlistItemsKey(variables.playlistId) });
    },
  });
}

export { playlistsKey, playlistDetailKey, playlistItemsKey };
