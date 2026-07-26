import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';

export function PlaylistErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <ErrorState
      title="بارگذاری لیست‌های پخش با خطا مواجه شد"
      message={message ?? 'امکان بارگذاری لیست‌های پخش در این لحظه وجود ندارد.'}
      action={onRetry ? <Button type="button" variant="secondary" onClick={onRetry}>تلاش دوباره</Button> : undefined}
    />
  );
}
