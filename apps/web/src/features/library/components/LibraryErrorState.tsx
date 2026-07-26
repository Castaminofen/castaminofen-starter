'use client';

import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';

export function LibraryErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title="بارگذاری کتابخانه با مشکل مواجه شد"
      description="در حال حاضر امکان دریافت داده‌های کتابخانه وجود ندارد. لطفاً دوباره تلاش کنید."
      message="دریافت اطلاعات کتابخانه ناموفق بود."
      action={<Button onClick={onRetry}>تلاش مجدد</Button>}
    />
  );
}
