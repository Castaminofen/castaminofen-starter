import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PlaylistActionBar({ onCreate, onRetry, onDelete, onPlayAll }: { onCreate?: () => void; onRetry?: () => void; onDelete?: () => void; onPlayAll?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {onPlayAll ? (
        <Button type="button" variant="primary" onClick={onPlayAll}>
          <Play className="h-4 w-4" aria-hidden="true" />
          پخش همه
        </Button>
      ) : null}
      {onCreate ? (
        <Button type="button" variant="primary" onClick={onCreate}>
          ساخت لیست پخش
        </Button>
      ) : null}
      {onDelete ? (
        <Button type="button" variant="secondary" onClick={onDelete}>
          حذف
        </Button>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          تلاش دوباره
        </Button>
      ) : null}
    </div>
  );
}
