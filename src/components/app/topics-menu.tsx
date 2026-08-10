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
  const [search, setSearch] = useState('');
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

  const filteredTopics = TOPICS.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const catLabel = CATEGORY_LABEL[t.category as keyof typeof CATEGORY_LABEL] ?? t.category;
    return (
      t.label.toLowerCase().includes(q) ||
      catLabel.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const grouped = filteredTopics.reduce<Record<string, typeof TOPICS>>((acc, topic) => {
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
          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
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
          className="absolute left-0 top-full z-40 mt-2 w-[min(48rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-4 shadow-xl"
          role="group"
          aria-label="Browse by topic"
        >
          {/* Header Search Filter */}
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search topics (e.g. Fintech, Solar, Comics, Gaming...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-paper px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:border-accent-500 focus:outline-none"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1.5 text-xs text-ink-muted hover:text-ink"
                >
                  ✕
                </button>
              )}
            </div>
            <Link
              href="/feed"
              onClick={() => setOpen(false)}
              className="shrink-0 text-xs font-semibold text-accent-700 hover:underline"
            >
              Browse All Ideas →
            </Link>
          </div>

          {/* Topics Grid Container */}
          <div className="max-h-[26rem] overflow-y-auto pr-1">
            {Object.keys(grouped).length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-muted">
                No topics matching &ldquo;{search}&rdquo;
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(grouped).map(([category, topics]) => (
                  <div key={category} className="rounded-lg border border-border/50 bg-paper/40 p-2.5">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-accent-900">
                      {CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL] ?? category}
                    </p>
                    <ul className="space-y-1">
                      {topics.map((topic) => (
                        <li key={topic.slug}>
                          <Link
                            href={`/topics/${topic.slug}`}
                            onClick={() => setOpen(false)}
                            className="block rounded px-2 py-1 text-xs font-medium text-ink transition-colors hover:bg-accent-100 hover:text-accent-900 focus-visible:outline-none"
                          >
                            {topic.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
