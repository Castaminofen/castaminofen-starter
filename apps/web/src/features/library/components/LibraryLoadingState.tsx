'use client';

export function LibraryLoadingState() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4 sm:p-6">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded-full bg-surface-tertiary" />
          <div className="h-3 w-56 animate-pulse rounded-full bg-surface-tertiary" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4 sm:p-5">
        <div className="mb-4 h-4 w-28 animate-pulse rounded-full bg-surface-tertiary" />
        <div className="space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface-primary/70 p-4">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-surface-tertiary" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-surface-tertiary" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-tertiary" />
              </div>
              <div className="h-9 w-20 animate-pulse rounded-xl bg-surface-tertiary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
