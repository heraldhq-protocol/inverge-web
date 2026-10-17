import type { ReactNode } from "react";

/**
 * Loading placeholder. Callers size it to the **final** dimensions — a skeleton
 * that collapses to full-height content is how you fail CLS.
 *
 * The shimmer only animates under `prefers-reduced-motion: no-preference`; the
 * global reduced-motion rule neutralises it for everyone else.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-lg bg-ink/[0.08] ${className}`}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-surface/70 to-transparent motion-safe:animate-[inv-shimmer_1.6s_infinite]" />
    </div>
  );
}

/** Announces that something is loading without describing the skeleton's shape. */
export function LoadingRegion({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
