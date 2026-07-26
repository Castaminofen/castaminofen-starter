'use client';

import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';

export function LibraryErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      className="border border-error/40 bg-surface-primary/70"
      title="بارگذاری کتابخانه با مشکل مواجه شد"
      description="در حال حاضر امکان دریافت داده‌های کتابخانه وجود ندارد. لطفاً دوباره تلاش کنید."
      message="دریافت اطلاعات کتابخانه ناموفق بود."
      action={
        <Button variant="secondary" onClick={onRetry}>
          تلاش مجدد
        </Button>
      }
    />
  );
}
