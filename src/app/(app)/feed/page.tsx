import type { Metadata } from 'next';
import { FeaturedCarousel } from '@/components/ideas/featured-carousel';
import { FeedBrowser } from '@/components/ideas/feed-browser';
import { TopicDirectory } from '@/components/ideas/topic-directory';
import { FeedLane, SectionHeading } from '@/components/ideas/feed-sections';
import { getFeed } from '@/lib/feed/feed-api';

export const metadata: Metadata = {
  title: 'Discover ideas',
  description:
    'Ideas from builders in Nigeria and West Africa, ranked by real support rather than by who paid.',
};

/**
 * Discovery.
 *
 * Order: featured carousel, then the browse grid, then the curated lanes.
 *
 * The carousel replaced a two-column hero that never balanced — a tall 2×2 stack set the height and left
 * a void under the featured card. Browsing comes second because a reader who knows what they want should
 * not have to scroll past curation to reach the search field, and the lanes sit last because they are
 * the "I have finished looking, show me something else" surface.
 *
 * The carousel and the lanes are server-rendered from the ranked feed. Only the browse grid is a client
 * island, since search, topics and paging are interactions (conventions §3.1).
 */
export default async function FeedPage() {
  const [firstPage, featured, closing, ready] = await Promise.all([
    getFeed({ take: 12 }),
    getFeed({ take: 6 }),
    getFeed({ collection: 'closing-soon', take: 8 }),
    getFeed({ collection: 'threshold-met', take: 8 }),
  ]);

  return (
    <div className="space-y-10 sm:space-y-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Ideas being validated
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted sm:text-sm">
          Support what you would use, tell the creator what is missing, and say what you would put in
          before anyone asks for money. Nothing is charged at this stage.
        </p>
      </header>

      <FeaturedCarousel items={featured.items} />

      <div>
        <SectionHeading>Browse every idea</SectionHeading>
        <FeedBrowser initialPage={firstPage} />
      </div>

      {closing.items.length > 0 && (
        <FeedLane title="Closing soon" items={closing.items} moreHref="/feed" />
      )}

      {ready.items.length > 0 && (
        <FeedLane title="Ready to raise" items={ready.items} moreHref="/feed" />
      )}

      {/* Last thing on the page, deliberately: a reader who has scrolled this far without finding
          something wants another way in, not another row of the same stream. */}
      <TopicDirectory items={firstPage.items} />
    </div>
  );
}
