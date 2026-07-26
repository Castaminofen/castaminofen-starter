import { Button } from '@/components/ui/button';
import type { PlaylistItem } from '../types';

export function PlaylistEpisodeList({ items, onPlay, onRemove }: { items: PlaylistItem[]; onPlay: (item: PlaylistItem) => void; onRemove: (item: PlaylistItem) => void }) {
  if (!items.length) {
    return <div className="rounded-2xl border border-dashed border-border bg-surface-primary/70 p-6 text-center text-text-secondary">این لیست هنوز اپیزودی ندارد. با افزودن اپیزودها، تجربه پخش بهتر می‌شود.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-primary/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">{item.episode.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{item.episode.podcast?.title ?? 'بدون پادکست'}</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
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
