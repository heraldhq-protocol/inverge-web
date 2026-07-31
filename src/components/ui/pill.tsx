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
  size = 'sm',
  marker,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: PillTone;
  /** `xs` is the card scale: metadata, not headline. `sm` is for detail pages. */
  size?: 'xs' | 'sm';
  /** A leading glyph for tones that need shape as well as colour. */
  marker?: React.ReactNode;
}) {
  const tones: Record<PillTone, string> = {
    neutral: 'bg-ink/6 text-ink-muted',
    accent: 'bg-accent-100 text-accent-900',
    danger: 'bg-danger-50 text-danger-700',
    promoted: 'bg-surface text-ink border border-accent-500/40',
  };

  const sizes = {
    xs: 'gap-1 px-2 py-px text-[10px]',
    sm: 'gap-1 px-2.5 py-0.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full font-semibold',
        sizes[size],
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
