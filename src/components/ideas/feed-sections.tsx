import React from 'react';
import Link from 'next/link';
import type { FeedItem } from '@/lib/feed/types';
import { IdeaCard } from './idea-card';

/**
 * The reference's hero module: one large card on the left, a 2×2 grid on the right (teardown §2,
 * module 3). It is the highest-value layout on the homepage and the reason the card has a `featured`
 * density at all.
 *
 * No per-module pagination. The reference paginates its "Recommended" rail, but our feed scores shift
 * between requests, so offset paging would be wrong — the main grid pages with `excludeIds` instead
 * (feed-api.md).
 */
export function FeedHero({ items }: { items: FeedItem[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  const companions = rest.slice(0, 4);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div>
        <SectionHeading>Featured idea</SectionHeading>
        <IdeaCard item={lead} size="featured" />
      </div>

      {companions.length > 0 && (
        <div>
          <SectionHeading>Worth a look</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            {companions.map((item) => (
              <IdeaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** The main 3-up grid. */
export function FeedGrid({ items }: { items: FeedItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="h-full">
          <IdeaCard item={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * A horizontal lane: heading, a "Discover more" link, and cards that clip at the right edge to signal
 * there is more (teardown §2, module 6). Scroll rather than arrows — a native scroller works with a
 * trackpad, a touch screen and the keyboard, which three arrow buttons do not.
 */
export function FeedLane({
  title,
  items,
  moreHref,
}: {
  title: string;
  items: FeedItem[];
  moreHref?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <SectionHeading className="mb-0">{title}</SectionHeading>
        {moreHref && (
          <Link
            href={moreHref}
            className="rounded text-sm font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Discover more
          </Link>
        )}
      </div>

      <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((item) => (
          <li key={item.id} className="w-[17rem] shrink-0 snap-start">
            <IdeaCard item={item} size="lane" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-3 font-display text-lg font-bold tracking-tight text-ink ${className ?? ''}`}>
      {children}
    </h2>
  );
}
