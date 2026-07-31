import React from 'react';
import { cn } from '@/lib/utils';

export type TimelineTone = 'accent' | 'neutral' | 'danger';

export type TimelineEntry = {
  id: string;
  /** Already formatted for display; the timeline does no date maths. */
  date: string;
  title: string;
  detail?: React.ReactNode;
  /** Receipt link or other trailing action. */
  action?: React.ReactNode;
  tone?: TimelineTone;
};

/**
 * Vertical dated events with a slot for a receipt on each row.
 *
 * This is the transparency dashboard in miniature (FR-802): a campaign's spine is dated events, and
 * every one of them has a receipt. Drawn as a rule with markers rather than icons, because the
 * information is the sequence, not the decoration (app-mockup-kit §4).
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const tones: Record<TimelineTone, string> = {
    accent: 'bg-accent-500',
    neutral: 'bg-ink/25',
    danger: 'bg-danger',
  };

  return (
    <ol className="relative ml-2 border-l border-border">
      {entries.map((entry) => (
        <li key={entry.id} className="relative py-4 pl-6">
          <span
            aria-hidden="true"
            className={cn(
              'absolute -left-[5px] top-6 h-[9px] w-[9px] rounded-full ring-2 ring-paper',
              tones[entry.tone ?? 'neutral']
            )}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-sm font-medium text-ink">{entry.title}</p>
            <p className="text-xs text-ink-muted tabular-nums">{entry.date}</p>
          </div>
          {entry.detail && <div className="mt-1 text-sm text-ink-muted">{entry.detail}</div>}
          {entry.action && <div className="mt-2">{entry.action}</div>}
        </li>
      ))}
    </ol>
  );
}
