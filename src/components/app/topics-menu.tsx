'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABEL, TOPICS } from '@/lib/feed/categories';

/**
 * Topics, as a panel rather than a second row of links.
 *
 * The reference runs fifteen categories as a permanent second row under its header. That works for a
 * site whose front door is a catalogue; ours is an app bar that deliberately carries almost nothing, and
 * a second row of fifteen links would out-weigh the page's own heading and eat a phone screen before any
 * content appeared. A panel keeps the bar at one row and still exposes the whole taxonomy in one click.
 *
 * Grouped by the API category each topic belongs to, so the grouping a reader sees is the same one the
 * backend enforces rather than a second, invented hierarchy.
 */
export function TopicsMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const grouped = TOPICS.reduce<Record<string, typeof TOPICS>>((acc, topic) => {
    (acc[topic.category] ??= []).push(topic);
    return acc;
  }, {});

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
          open ? 'bg-ink/5 text-ink' : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
        )}
      >
        Topics
        <span
          aria-hidden="true"
          className={cn('text-[10px] transition-transform', open && 'rotate-180')}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-40 mt-2 w-[min(44rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-4 shadow-lift"
          role="group"
          aria-label="Browse by topic"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(grouped).map(([category, topics]) => (
              <div key={category}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL] ?? category}
                </p>
                <ul className="space-y-0.5">
                  {topics.map((topic) => (
                    <li key={topic.slug}>
                      <Link
                        href={`/topics/${topic.slug}`}
                        onClick={() => setOpen(false)}
                        className="block rounded px-2 py-1.5 text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      >
                        {topic.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <Link
              href="/feed"
              onClick={() => setOpen(false)}
              className="rounded text-sm font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              See every idea being validated
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
