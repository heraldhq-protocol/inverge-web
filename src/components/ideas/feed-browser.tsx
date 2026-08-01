'use client';

import Link from 'next/link';
import { useEffect, useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { useFeed } from '@/lib/feed/use-feed';
import { COLLECTIONS, TOPICS, topicFor } from '@/lib/feed/categories';
import type { FeedResponse } from '@/lib/feed/types';
import { IdeaCard, IdeaCardSkeleton } from './idea-card';

/**
 * Search, topic and collection filtering over the ranked feed, with client paging.
 *
 * Mobile first, and it is the reason for most of the layout decisions here: the topic bar is a single
 * horizontally scrollable row rather than a wrapping block (fifteen wrapping chips eat a phone screen
 * before any content appears), the grid is one column until `sm`, and the controls stack.
 *
 * Search debounces at 250ms and is **not** a page navigation: re-rendering the whole route on every
 * keystroke would throw away scroll position and re-fetch the hero. It updates the query key, and
 * TanStack keeps the previous page on screen while the next one loads.
 */
export function FeedBrowser({ initialPage }: { initialPage: FeedResponse }) {
  const [rawQuery, setRawQuery] = useState('');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string>('');
  const [collection, setCollection] = useState<string>('');
  const searchId = useId();

  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const filtered = Boolean(query || topic || collection);

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, isError, refetch } = useFeed(
    { q: query, topic, collection },
    // The seeded page is only correct for the unfiltered view; once a filter is on, let it fetch.
    filtered ? undefined : initialPage
  );

  const items = useMemo(() => (data ?? []).flatMap((page) => page.items), [data]);
  const total = data?.[0]?.total ?? items.length;

  function clearAll() {
    setRawQuery('');
    setQuery('');
    setTopic('');
    setCollection('');
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section aria-label="Browse ideas" className="space-y-6">
      {/* Search + collections. Stacks on a phone, one row from sm up. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search ideas
          </label>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            id={searchId}
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search ideas, places, creators"
            className="min-h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted transition-all focus:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/20"
          />
        </div>

        <div className="flex min-w-0 shrink items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {COLLECTIONS.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCollection(collection === c.slug ? '' : c.slug)}
              aria-pressed={collection === c.slug}
              title={c.blurb}
              className={cn(
                'min-h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
                collection === c.slug
                  ? 'border-accent-500 bg-accent-100/90 font-semibold text-accent-900 shadow-2xs'
                  : 'border-border bg-surface text-ink-muted hover:border-ink/20 hover:text-ink'
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Topics. One scrollable row: fifteen wrapping chips would push content off a phone screen. */}
      <div className="w-full min-w-0 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max items-center gap-1.5 pb-1">
          <TopicChip active={!topic} onClick={() => setTopic('')} label="All topics" />
          {TOPICS.map((t) => (
            <TopicChip
              key={t.slug}
              active={topic === t.slug}
              onClick={() => setTopic(topic === t.slug ? '' : t.slug)}
              label={t.label}
            />
          ))}
        </div>
      </div>

      {/* Counter & Active Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted tabular-nums" aria-live="polite">
          <span>
            {isFetching && !isFetchingNextPage
              ? 'Searching…'
              : `Showing ${items.length} of ${total} ${total === 1 ? 'idea' : 'ideas'}`}
          </span>
          {topic && (
            <>
              <span>·</span>
              <Link
                href={`/topics/${topic}`}
                className="rounded font-semibold text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                Open {topicFor(topic)?.label ?? 'topic'} page
              </Link>
            </>
          )}
        </div>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs font-semibold text-accent-700">
            Clear filters
          </Button>
        )}
      </div>

      {isError ? (
        <EmptyState
          title="We could not load ideas just now"
          body="Nothing is lost. Try again, and if it keeps happening it is on our side."
          actions={
            <Button variant="primary" size="md" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : items.length === 0 && !isFetching ? (
        <EmptyState
          title={query ? `Nothing matches “${query}” yet.` : 'No ideas here yet.'}
          body="Publishing an idea is free, and nothing is charged while it is being validated."
          actions={
            <>
              <Button variant="primary" size="md" href="/ideas/new">
                Start an idea
              </Button>
              {filtered && (
                <Button variant="outline" size="md" onClick={clearAll}>
                  Clear filters
                </Button>
              )}
            </>
          }
        />
      ) : (
        <>
          {/* Responsive Cards Grid */}
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <li key={item.id} className="h-full">
                <IdeaCard item={item} />
              </li>
            ))}
            {/* Skeletons on initial search or load-more */}
            {(isFetchingNextPage || (isFetching && items.length === 0)) &&
              Array.from({ length: isFetchingNextPage ? 4 : 8 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="h-full">
                  <IdeaCardSkeleton />
                </li>
              ))}
          </ul>

          {/* Load More Action Bar */}
          {hasNextPage && (
            <div className="flex flex-col items-center gap-3 pt-6 pb-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 shadow-xs hover:border-accent-500/50"
              >
                {isFetchingNextPage ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-accent-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading more ideas…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Show me more
                    <svg className="h-4 w-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </Button>
              <p className="text-xs text-ink-muted tabular-nums">
                Loaded {items.length} of {total} ideas
              </p>
            </div>
          )}

          {/* End of Feed Indicator */}
          {!hasNextPage && items.length > 0 && (
            <div className="flex flex-col items-center gap-2 py-8 border-t border-border/40 mt-8">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-xs font-medium text-ink-muted">
                You&apos;ve explored all ideas matching this view.
              </p>
              <button
                type="button"
                onClick={scrollToTop}
                className="text-xs font-semibold text-accent-700 hover:underline pt-1"
              >
                Back to top ↑
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function TopicChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-9 shrink-0 rounded-full border px-3.5 text-[13px] transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
        active
          ? 'border-accent-500 bg-accent-500 font-semibold text-white shadow-xs'
          : 'border-border bg-surface font-medium text-ink-muted hover:border-accent-500/40 hover:text-ink'
      )}
    >
      {label}
    </button>
  );
}
