import clsx from 'clsx';
import { LoaderCircle } from 'lucide-react';

export function LoadingState({
  message = 'در حال بارگذاری…',
  className,
  title,
}: {
  message?: string;
  className?: string;
  title?: string;
}) {
  return (
    <div className={clsx('loading-state', className)} role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          {title ? <p className="m-0 text-sm font-semibold text-text-primary">{title}</p> : null}
          <p className="m-0 text-sm text-text-secondary">{message}</p>
        </div>
      </div>
    </div>
  );
}
