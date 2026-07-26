'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlaylistCard } from './PlaylistCard';
import { PlaylistEmptyState } from './PlaylistEmptyState';
import { PlaylistErrorState } from './PlaylistErrorState';
import { PlaylistFormDialog } from './PlaylistFormDialog';
import { PlaylistLoadingState } from './PlaylistLoadingState';
import { useCreatePlaylist, useDeletePlaylist, usePlaylists, useUpdatePlaylist } from '../hooks/usePlaylists';
import type { Playlist, PlaylistFormValues } from '../types';

export function PlaylistList() {
  const playlistsQuery = usePlaylists();
  const createMutation = useCreatePlaylist();
  const updateMutation = useUpdatePlaylist();
  const deleteMutation = useDeletePlaylist();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  const initialValues = useMemo<PlaylistFormValues>(() => ({
    title: activePlaylist?.title ?? '',
    description: activePlaylist?.description ?? '',
    imageUrl: activePlaylist?.imageUrl ?? '',
    isPublic: activePlaylist?.isPublic ?? false,
  }), [activePlaylist]);

  async function handleSubmit(values: PlaylistFormValues) {
    if (mode === 'edit' && activePlaylist) {
      await updateMutation.mutateAsync({ id: activePlaylist.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setDialogOpen(false);
    setActivePlaylist(null);
  }

  if (playlistsQuery.isLoading) {
    return <PlaylistLoadingState />;
  }

  if (playlistsQuery.isError) {
    return <PlaylistErrorState message={playlistsQuery.error?.message ?? 'Unable to load playlists'} onRetry={() => void playlistsQuery.refetch()} />;
  }

  const playlists = playlistsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading">لیست‌های پخش</h1>
          <p className="text-body m-0">لیست‌های پخش شما در اینجا نگهداری می‌شوند و در مرحله MVP ساده و مستقیم هستند.</p>
        </div>
        <Button type="button" variant="primary" onClick={() => {
          setMode('create');
          setActivePlaylist(null);
          setDialogOpen(true);
        }}>
          ساخت لیست پخش
        </Button>
      </div>

      {playlists.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onEdit={() => {
                setMode('edit');
                setActivePlaylist(playlist);
                setDialogOpen(true);
              }}
              onDelete={async (id) => {
                const confirmed = window.confirm('این لیست پخش حذف شود؟');
                if (!confirmed) {
                  return;
                }
                await deleteMutation.mutateAsync({ id });
              }}
            />
          ))}
        </div>
      ) : (
        <PlaylistEmptyState onCreate={() => {
          setMode('create');
          setActivePlaylist(null);
          setDialogOpen(true);
        }} />
      )}

      <PlaylistFormDialog
        open={dialogOpen}
        mode={mode}
        initialValues={initialValues}
        onClose={() => {
          setDialogOpen(false);
          setActivePlaylist(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
