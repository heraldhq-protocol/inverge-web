import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FeedGrid } from '@/components/ideas/feed-sections';
import { FilterRail, SortSelect } from '@/components/ideas/filter-rail';
import { CATEGORY_LABEL, TOPICS, topicFor } from '@/lib/feed/categories';
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
  const topicSlugs = TOPICS.map((t) => ({ slug: t.slug }));
  const categorySlugs = (Object.keys(CATEGORY_LABEL) as string[]).map((s) => ({ slug: s }));
  // Deduplicate in case any topic slug matches a category slug
  const seen = new Set(topicSlugs.map((t) => t.slug));
  const unique = categorySlugs.filter((c) => !seen.has(c.slug));
  return [...topicSlugs, ...unique];
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

import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  const { items } = await getFeed({ topic: topic.slug, take: 50 });

  const filters = filtersFromParams(query);
  const visible = applyFilters(items, filters);
  const counts = facetCounts(items, filters);
  const regions = regionsOf(items);

  const siblingTopics = TOPICS.filter((t) => t.category === topic.category);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-4">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 text-xs text-ink-muted flex items-center gap-1.5">
            <Link href="/feed" className="hover:text-ink hover:underline">
              Discover
            </Link>
            <span aria-hidden="true" className="text-ink-muted/40">
              /
            </span>
            <Link href="/topics" className="hover:text-ink hover:underline">
              Topics
            </Link>
            <span aria-hidden="true" className="text-ink-muted/40">
              /
            </span>
            <span className="font-semibold text-ink">{topic.label}</span>
          </nav>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {topic.label}
          </h1>
          <p className="mt-1 text-xs text-ink-muted tabular-nums" aria-live="polite">
            Showing {visible.length} {visible.length === 1 ? 'idea' : 'ideas'} being validated
            {hasAnyFilter(filters) && items.length !== visible.length && (
              <span className="text-ink-muted/80"> (filtered from {items.length})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <SortSelect value={filters.sort} />
        </div>
      </div>

      {/* Sibling Sub-Topics Navigation Pills */}
      {siblingTopics.length > 1 && (
        <div className="w-full min-w-0 overflow-x-auto no-scrollbar pb-1">
          <div className="flex min-w-max items-center gap-1.5">
            {siblingTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}`}
                className={cn(
                  'rounded-full px-3.5 py-1 text-xs font-medium transition-all shrink-0',
                  slug === t.slug
                    ? 'bg-ink text-surface font-semibold shadow-xs'
                    : 'border border-border/60 bg-surface text-ink-muted hover:border-ink/30 hover:text-ink'
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start pt-1">
        <FilterRail filters={filters} counts={counts} regions={regions} total={visible.length} />

        <div className="min-w-0 space-y-5">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-surface p-8 sm:p-12 text-center shadow-xs">
              <div className="mx-auto max-w-md space-y-3">
                <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                  {hasAnyFilter(filters)
                    ? 'No ideas match these specific filters.'
                    : `No ${topic.label.toLowerCase()} ideas published yet.`}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Publishing an idea is completely free. Be the first creator to validate an idea in {topic.label}!
                </p>
                <div className="pt-3 flex flex-wrap justify-center gap-3">
                  <Button variant="primary" size="md" href="/ideas/new">
                    Start an idea
                  </Button>
                  {hasAnyFilter(filters) && (
                    <Button variant="outline" size="md" href={`/topics/${topic.slug}`}>
                      Reset filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <FeedGrid items={visible} />
          )}
        </div>
      </div>
    </div>
  );
}
