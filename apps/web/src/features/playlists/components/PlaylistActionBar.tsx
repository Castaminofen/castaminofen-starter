import { Button } from '@/components/ui/button';

export function PlaylistActionBar({ onCreate, onRetry, onDelete }: { onCreate?: () => void; onRetry?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
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
