import Link from 'next/link';
import { CampaignCard } from './campaign-card';
import type { CampaignListItem } from '@/lib/campaigns/types';

/**
 * A named lane of campaigns. Same shape rule as `FeedLane`: grid when it is short, scroller when it
 * is long, because a fixed-width scroller holding two cards reads as a broken carousel.
 *
 * The clipped last card in the scrolling variant is the reference's affordance for "there is more
 * this way" (teardown §2 module 6) and it is free with `overflow-x`.
 */
export function CampaignLane({
  title,
  blurb,
  items,
  moreHref,
  moreLabel = 'See all',
}: {
  title: string;
  blurb?: string;
  items: CampaignListItem[];
  moreHref?: string;
  moreLabel?: string;
}) {
  if (items.length === 0) return null;
  const asGrid = items.length <= 3;

  return (
    <section className="w-full overflow-hidden">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">
            {title}
          </h2>
          {blurb && <p className="mt-1 max-w-[68ch] text-sm text-ink-muted">{blurb}</p>}
        </div>
        {moreHref && (
          <Link
            href={moreHref}
            className="rounded text-[13px] font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            {moreLabel}
          </Link>
        )}
      </div>

      {asGrid ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="h-full">
              <CampaignCard campaign={item} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex w-full min-w-0 snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <li key={item.id} className="w-[16rem] shrink-0 snap-start sm:w-[18rem]">
              <CampaignCard campaign={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
