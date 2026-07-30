import React from 'react';
import { cn } from '@/lib/utils';

export type CardTone = 'default' | 'promoted' | 'quiet';

/**
 * Grouped content on a white surface with a warm hairline.
 *
 * No shadow by default: elevation is used sparingly and never on every card at once
 * (app-mockup-kit §4). `promoted` is the paid-placement treatment and is deliberately a different
 * surface and border rather than a badge, so it can never be mistaken for an organic result
 * (FR-206a).
 */
export function Card({
  tone = 'default',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: CardTone }) {
  const tones: Record<CardTone, string> = {
    default: 'bg-surface border-border',
    promoted: 'bg-accent-50 border-accent-500/35',
    quiet: 'bg-paper border-border',
  };

  return (
    <div
      className={cn('rounded-xl border', tones[tone], className)}
      {...props}
    >
      {children}
    </div>
  );
}
