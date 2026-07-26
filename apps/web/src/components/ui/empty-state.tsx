import clsx from 'clsx';
import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-surface-secondary/70 p-6 text-start shadow-soft sm:p-8', className)} role="status">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-subheading">{title}</h3>
          {description ? <p className="text-body m-0">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
