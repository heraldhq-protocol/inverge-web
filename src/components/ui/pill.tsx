import React from 'react';
import { cn } from '@/lib/utils';

export type PillTone = 'neutral' | 'accent' | 'danger' | 'promoted';

/**
 * Small status label. Every tone carries meaning in its text, never in colour alone (WCAG 1.4.1), and
 * the badge vocabulary is a closed list of five — Promoted, Featured, Threshold met, Ending soon,
 * Verified creator (teardown §7). Nothing else becomes a pill without a backend field behind it.
 *
 * Small green text steps down to accent-700: mid-green on a light surface lands near 3:1, which fails
 * for body-size text (conventions §5.2).
 */
export function Pill({
  tone = 'neutral',
  marker,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: PillTone;
  /** A leading glyph for tones that need shape as well as colour. */
  marker?: React.ReactNode;
}) {
  const tones: Record<PillTone, string> = {
    neutral: 'bg-ink/6 text-ink-muted',
    accent: 'bg-accent-100 text-accent-900',
    danger: 'bg-danger-50 text-danger-700',
    promoted: 'bg-surface text-ink border border-accent-500/40',
  };

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className
      )}
      {...props}
    >
      {marker}
      {children}
    </span>
  );
}
