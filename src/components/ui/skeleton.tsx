import { cn } from '@/lib/utils';

/**
 * Loading placeholder. Callers size it to the **final** dimensions — a skeleton that collapses to
 * full-height content is how you fail CLS (conventions §7, §10).
 *
 * The shimmer is gated: `data-shimmer` only animates inside the no-preference media query in
 * globals.css, so a reduced-motion user gets a still block.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative overflow-hidden rounded-lg bg-ink/8', className)}
    >
      <span
        data-shimmer="true"
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-surface/70 to-transparent"
      />
    </div>
  );
}

/** Announces that something is loading without describing the skeleton's shape. */
export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
