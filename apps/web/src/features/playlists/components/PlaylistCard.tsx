'use client';

import Link from 'next/link';
import { ListMusic, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlaylistPlaceholderLabel } from '../utils/playlist-utils';
import type { Playlist } from '../types';

export function PlaylistCard({ playlist, onDelete, onEdit }: { playlist: Playlist; onDelete?: (id: string) => void; onEdit?: (playlist: Playlist) => void }) {
  return (
    <article className="card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-primary text-sm font-semibold text-text-primary">
            {playlist.imageUrl ? <span className="h-full w-full rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${playlist.imageUrl})` }} aria-hidden="true" /> : <span>{getPlaylistPlaceholderLabel(playlist.title)}</span>}
          </div>
          <div className="min-w-0">
            <h3 className="text-subheading">{playlist.title}</h3>
            <p className="text-caption">{playlist.itemCount ?? 0} آیتم</p>
          </div>
        </div>
        <div className="rounded-full border border-border bg-surface-primary px-3 py-1 text-xs text-text-secondary">
          {playlist.isPublic ? 'عمومی' : 'خصوصی'}
        </div>
      </div>

      <p className="text-body m-0 line-clamp-3">{playlist.description || 'هنوز توضیحی برای این لیست اضافه نشده است.'}</p>

      <div className="flex flex-wrap gap-2">
        <Link href={`/playlists/${playlist.id}`} className="button button-secondary flex-1 justify-center">
          <ListMusic className="h-4 w-4" aria-hidden="true" />
          جزئیات
        </Link>
        <Button type="button" variant="primary" size="sm" onClick={() => onEdit?.(playlist)} aria-label={`ویرایش ${playlist.title}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          ویرایش
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => onDelete?.(playlist.id)} aria-label={`حذف ${playlist.title}`}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
