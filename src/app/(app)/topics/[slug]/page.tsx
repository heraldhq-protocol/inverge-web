import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FeedGrid } from '@/components/ideas/feed-sections';
import { FilterRail, SortSelect } from '@/components/ideas/filter-rail';
import { TOPICS, topicFor } from '@/lib/feed/categories';
import { getFeed } from '@/lib/feed/feed-api';
import {
  applyFilters,
  facetCounts,
  filtersFromParams,
  hasAnyFilter,
  regionsOf,
} from '@/lib/feed/filters';

/**
 * A page per topic, with its own filters, count and URL.
 *
 * The reference has one of these per category and it does two jobs the feed cannot: it is a shareable,
 * indexable landing point for people arriving from search with a specific interest, and it is the only
 * surface where narrowing by more than one dimension at a time makes sense. The feed stays a single
 * ranked stream; refinement happens here.
 *
 * Server-rendered from the URL, so every filtered view is shareable and survives a refresh. The rail is
 * the only client component on the page.
 */

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = topicFor(slug);
  if (!topic) return { title: 'Topic not found' };
  return {
    title: `${topic.label} ideas`,
    description: `Ideas in ${topic.label.toLowerCase()} being validated by backers in Nigeria and West Africa. Nothing is charged while an idea is being validated.`,
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const topic = topicFor(slug);
  if (!topic) notFound();

  // The whole topic pool is fetched once, then narrowed in memory. That is honest at this size and
  // wrong at scale: when the API grows filter params, these move into the query and only a page comes
  // back. `facetCounts` is the piece that needs a server-side equivalent first — counts cannot be
  // computed from a page you have not fetched.
  const { items } = await getFeed({ topic: topic.slug, take: 50 });

  const filters = filtersFromParams(query);
  const visible = applyFilters(items, filters);
  const counts = facetCounts(items, filters);
  const regions = regionsOf(items);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted">
        <a href="/feed" className="rounded hover:text-ink hover:underline underline-offset-2">
          Discover
        </a>
        <span aria-hidden="true" className="mx-1.5">
          /
        </span>
        <span className="text-ink">{topic.label}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <FilterRail filters={filters} counts={counts} regions={regions} total={visible.length} />

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {topic.label}
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted tabular-nums" aria-live="polite">
                {visible.length} {visible.length === 1 ? 'idea' : 'ideas'}
                {hasAnyFilter(filters) && items.length !== visible.length && (
                  <span className="text-ink-muted/80"> of {items.length}</span>
                )}
              </p>
            </div>

            <SortSelect value={filters.sort} />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title={
                hasAnyFilter(filters)
                  ? 'Nothing matches those filters yet.'
                  : `No ${topic.label.toLowerCase()} ideas yet. Yours would be the first.`
              }
              body="Publishing an idea is free, and nothing is charged while it is being validated."
              actions={
                <>
                  <Button variant="primary" size="md" href="/ideas/new">
                    Start an idea
                  </Button>
                  {hasAnyFilter(filters) && (
                    <Button variant="outline" size="md" href={`/topics/${topic.slug}`}>
                      Clear filters
                    </Button>
                  )}
                </>
              }
            />
          ) : (
            <FeedGrid items={visible} />
          )}
        </div>
      </div>
    </div>
  );
}
