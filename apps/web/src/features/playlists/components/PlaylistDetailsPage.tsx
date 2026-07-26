'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerRuntime } from '@/features/player';
import { PlaylistActionBar } from './PlaylistActionBar';
import { PlaylistEpisodeList } from './PlaylistEpisodeList';
import { PlaylistErrorState } from './PlaylistErrorState';
import { PlaylistLoadingState } from './PlaylistLoadingState';
import { useDeletePlaylist, usePlaylist, useRemovePlaylistItem } from '../hooks/usePlaylists';
import { buildPlaylistPlaybackPlan } from '../utils/playlistPlayback';
import { getPlaylistPlaceholderLabel } from '../utils/playlist-utils';

export function PlaylistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params?.id as string | undefined;
  const query = usePlaylist(playlistId);
  const deleteMutation = useDeletePlaylist();
  const removeItemMutation = useRemovePlaylistItem();
  const playerRuntime = usePlayerRuntime();

  const playlist = query.data;
  const itemCount = playlist?.itemCount ?? playlist?.items?.length ?? 0;

  async function handleDelete() {
    if (!playlistId) {
      return;
    }

    const confirmed = window.confirm('این لیست پخش حذف شود؟');
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: playlistId });
      router.push('/playlists');
    } catch {
      // Error is surfaced through the mutation state below.
    }
  }

  async function handleRemoveEpisode(episodeId: string) {
    if (!playlistId) {
      return;
    }

    await removeItemMutation.mutateAsync({ playlistId, episodeId });
  }

  async function handlePlayAll() {
    if (!playlist?.items?.length) {
      return;
    }

    const plan = buildPlaylistPlaybackPlan(playlist.items);
    await playerRuntime.replaceQueue(plan.queue, plan.startIndex);
  }

  async function handlePlayFromEpisode(episodeId: string) {
    if (!playlist?.items?.length) {
      return;
    }

    const plan = buildPlaylistPlaybackPlan(playlist.items, episodeId);
    await playerRuntime.replaceQueue(plan.queue, plan.startIndex);
  }

  if (query.isLoading) {
    return <PlaylistLoadingState />;
  }

  if (query.isError || !playlist) {
    return <PlaylistErrorState message={query.error?.message ?? 'Unable to load playlist'} onRetry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <Link href="/playlists" className="button button-ghost w-fit">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        بازگشت به لیست‌ها
      </Link>

      <section className="card space-y-5">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface-primary text-xl font-semibold text-text-primary">
            {playlist.imageUrl ? <span className="h-full w-full rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${playlist.imageUrl})` }} aria-hidden="true" /> : <span>{getPlaylistPlaceholderLabel(playlist.title)}</span>}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-heading">{playlist.title}</h1>
              <span className="rounded-full border border-border bg-surface-primary px-3 py-1 text-xs text-text-secondary">{playlist.isPublic ? 'عمومی' : 'خصوصی'}</span>
            </div>
            <p className="text-body m-0">{playlist.description || 'توضیحی برای این لیست پخش ثبت نشده است.'}</p>
            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
              <span>{itemCount} آیتم</span>
              <span>به‌روز شده در {new Date(playlist.updatedAt).toLocaleDateString('fa-IR')}</span>
            </div>
          </div>
          <PlaylistActionBar onDelete={handleDelete} onPlayAll={handlePlayAll} />
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-subheading">اپیزودهای این لیست</h2>
            <p className="text-caption m-0">برای افزودن اپیزود، از صفحه اپیزودها یا پادکست‌ها استفاده کنید.</p>
          </div>
          <Button type="button" variant="secondary" disabled>
            <Plus className="h-4 w-4" aria-hidden="true" />
            افزودن اپیزود
          </Button>
        </div>

        <PlaylistEpisodeList
          items={playlist.items ?? []}
          onPlay={(item) => {
            void handlePlayFromEpisode(item.episodeId);
          }}
          onRemove={(item) => {
            void handleRemoveEpisode(item.episodeId);
          }}
        />
      </section>
    </div>
  );
}
