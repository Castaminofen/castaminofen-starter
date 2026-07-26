import { Button } from '@/components/ui/button';
import type { PlaylistItem } from '../types';

export function PlaylistEpisodeList({ items, onPlay, onRemove }: { items: PlaylistItem[]; onPlay: (item: PlaylistItem) => void; onRemove: (item: PlaylistItem) => void }) {
  if (!items.length) {
    return <div className="rounded-2xl border border-dashed border-border p-6 text-center text-text-secondary">این لیست هنوز اپیزودی ندارد.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-primary p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{item.episode.title}</h3>
            <p className="text-sm text-text-secondary">{item.episode.podcast?.title ?? 'بدون پادکست'}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => onPlay(item)}>
              پخش
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item)}>
              حذف
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
