import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Disclosure row built on native `<details>/<summary>`: keyboard, screen-reader semantics and
 * find-in-page all work with no JavaScript and no `'use client'` (conventions §3).
 *
 * `lastUpdated` is the reference's credibility device on FAQ answers (teardown §5.4) — a timestamp we
 * already hold, doing real work.
 */
export function Disclosure({
  summary,
  lastUpdated,
  defaultOpen = false,
  className,
  children,
}: {
  summary: React.ReactNode;
  lastUpdated?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn('group border-b border-border last:border-b-0', className)}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-medium text-ink marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <span
          aria-hidden="true"
          className="shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        >
          ⌄
        </span>
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-ink-muted">
        {children}
        {lastUpdated && <p className="mt-3 text-xs text-ink-muted/80">Last updated {lastUpdated}</p>}
      </div>
    </details>
  );
}
