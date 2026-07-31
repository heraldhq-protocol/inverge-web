import React from 'react';
import Link from 'next/link';
import type { FeedItem } from '@/lib/feed/types';
import { IdeaCard } from './idea-card';

/**
 * The reference's hero module: one large card on the left, a 2×2 grid on the right (teardown §2,
 * module 3).
 *
 * Cards stretch to equal height **within a row**, so a row never ends ragged — this matters most for a
 * promoted card, whose extra header row would otherwise leave its neighbours short.
 *
 * The two hero columns are `items-start` at the section level, though: the featured card must not be
 * stretched to match the height of a 2×2 stack beside it, because that surplus height lands as one large
 * empty gap inside a single card rather than being shared.
 */
export function FeedHero({ items }: { items: FeedItem[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  const companions = rest.slice(0, 4);

  return (
    <section className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
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

/** The main grid, used wherever a plain list of cards is wanted. */
export function FeedGrid({ items }: { items: FeedItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="h-full">
          <IdeaCard item={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * A named lane: heading, a "Discover more" link, then the cards.
 *
 * **Grid when the lane is short, scroller when it is long.** A fixed-width horizontal scroller holding
 * two cards leaves most of the row empty and reads as a broken carousel, which is exactly what a lane
 * backed by a narrow filter produces. Four or fewer items fill the row as a grid; more than that gets the
 * scroller, where the clipped last card is a real affordance rather than an accident.
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
  const asGrid = items.length <= 4;

  return (
    <section className="w-full overflow-hidden">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <SectionHeading className="mb-0">{title}</SectionHeading>
        {moreHref && (
          <Link
            href={moreHref}
            className="rounded text-[13px] font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Discover more
          </Link>
        )}
      </div>

      {asGrid ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="h-full">
              <IdeaCard item={item} size="lane" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex w-full min-w-0 snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <li key={item.id} className="w-[15rem] shrink-0 snap-start sm:w-[17rem]">
              <IdeaCard item={item} size="lane" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SectionHeading({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={`mb-3 font-display text-base font-bold tracking-tight text-ink sm:text-lg ${className ?? ''}`}
    >
      {children}
    </h2>
  );
}
