import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryFilter } from '@/components/ideas/category-filter';
import { FeedGrid, FeedHero, FeedLane, SectionHeading } from '@/components/ideas/feed-sections';
import { getFeed } from '@/lib/feed/feed-api';
import { CATEGORIES, type IdeaCategory } from '@/lib/feed/types';

export const metadata: Metadata = {
  title: 'Discover ideas',
  description:
    'Ideas from builders in Nigeria and West Africa, ranked by real support rather than by who paid.',
};

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);

function asCategory(value: string | string[] | undefined): IdeaCategory | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first && (CATEGORY_VALUES as string[]).includes(first) ? (first as IdeaCategory) : undefined;
}

/**
 * Discovery. Server Component: the whole page is a read, and the only interactive parts are links.
 *
 * `searchParams` is a Promise in Next 16 (conventions §2.1). The category lane lives in the URL so it
 * is shareable and server-rendered; `excludeIds` deliberately does not, because it is a session
 * artefact rather than something worth sharing.
 */
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = asCategory(params.category);

  const { items } = await getFeed({ category, take: 25 });

  if (items.length === 0) {
    const label = category ? CATEGORIES.find((c) => c.value === category)?.label.toLowerCase() : null;
    return (
      <div className="space-y-6">
        <FeedHeader />
        <CategoryFilter active={category} resultCount={0} />
        <EmptyState
          title={label ? `No ${label} ideas yet. Yours would be the first.` : 'Nothing here yet. Be the first to publish an idea.'}
          body="Publishing an idea is free, and nothing is charged while it is being validated."
          actions={
            <>
              <Button variant="primary" size="md" href="/ideas/new">
                Start an idea
              </Button>
              {category && (
                <Button variant="outline" size="md" href="/feed">
                  Clear filters
                </Button>
              )}
            </>
          }
        />
      </div>
    );
  }

  // Items arrive in final ranked order and are rendered top to bottom — nothing here re-sorts
  // (feed-api.md). The hero takes the first five, the grid takes the rest.
  const heroItems = items.slice(0, 5);
  const gridItems = items.slice(5);
  const nearlyClosing = items
    .filter((i) => i.status === 'VALIDATING' && !i.promoted)
    .slice(-3)
    .reverse();

  return (
    <div className="space-y-10">
      <FeedHeader />
      <CategoryFilter active={category} resultCount={items.length} />

      <FeedHero items={heroItems} />

      {gridItems.length > 0 && (
        <section>
          <SectionHeading>More ideas being validated</SectionHeading>
          <FeedGrid items={gridItems} />
        </section>
      )}

      {/* The reference's "Home Stretch" lane, in our terms: validation windows closing soonest. */}
      {!category && nearlyClosing.length > 0 && (
        <FeedLane title="Closing soon" items={nearlyClosing} moreHref="/feed" />
      )}
    </div>
  );
}

function FeedHeader() {
  return (
    <header className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Ideas being validated
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Support what you would use, tell the creator what is missing, and say what you would put in
        before anyone asks for money. Nothing is charged at this stage.
      </p>
    </header>
  );
}
