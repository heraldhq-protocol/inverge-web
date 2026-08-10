'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionHeading } from './feed-sections';
import { CATEGORY_LABEL, TOPICS } from '@/lib/feed/categories';
import type { FeedItem, IdeaCategory } from '@/lib/feed/types';
import { cn } from '@/lib/utils';

export type CategoryGroup = {
  id: string;
  name: string;
  categories: IdeaCategory[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'tech-venture',
    name: 'Technology & Venture',
    categories: [
      'software',
      'technology',
      'fintech',
      'agritech',
      'healthtech',
      'cleantech',
      'edtech',
      'logistics',
      'e-commerce',
      'web3',
    ],
  },
  {
    id: 'arts-design',
    name: 'Arts, Crafts & Design',
    categories: ['art', 'arts', 'comics', 'crafts', 'dance', 'design', 'fashion', 'photography'],
  },
  {
    id: 'film-media',
    name: 'Film, Media & Publishing',
    categories: ['film', 'journalism', 'music', 'publishing', 'theater'],
  },
  {
    id: 'lifestyle-food',
    name: 'Food, Games & Community',
    categories: ['food', 'games', 'community', 'agriculture', 'other'],
  },
];

export function TopicDirectory({ items }: { items: FeedItem[] }) {
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const counts = new Map<string, number>();
  for (const item of items) {
    for (const slug of item.topics ?? []) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  const grouped = TOPICS.reduce<Record<string, typeof TOPICS>>((acc, topic) => {
    (acc[topic.category] ??= []).push(topic);
    return acc;
  }, {});

  const displayedGroups = activeGroup === 'all'
    ? CATEGORY_GROUPS
    : CATEGORY_GROUPS.filter((g) => g.id === activeGroup);

  return (
    <section aria-labelledby="browse-by-topic" className="space-y-6 pt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-4">
        <div>
          <SectionHeading className="mb-1" id="browse-by-topic">
            Browse by Topic & Discipline
          </SectionHeading>
          <p className="text-[13px] text-ink-muted">
            Explore active validation ideas across tech ventures, creative arts, physical products, and media.
          </p>
        </div>

        {/* Group Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={() => setActiveGroup('all')}
            className={cn(
              'rounded-full px-3.5 py-1 text-xs font-semibold transition-all',
              activeGroup === 'all'
                ? 'bg-ink text-surface shadow-xs'
                : 'bg-paper text-ink-muted hover:bg-ink/5 hover:text-ink'
            )}
          >
            All Disciplines
          </button>
          {CATEGORY_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroup(group.id)}
              className={cn(
                'rounded-full px-3.5 py-1 text-xs font-medium transition-all',
                activeGroup === group.id
                  ? 'bg-ink text-surface font-semibold shadow-xs'
                  : 'bg-paper text-ink-muted hover:bg-ink/5 hover:text-ink'
              )}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Multi-Column Category Directory */}
      <div className="space-y-10 pt-2">
        {displayedGroups.map((group) => {
          const groupCategories = group.categories.filter((cat) => grouped[cat]?.length > 0);
          if (groupCategories.length === 0) return null;

          return (
            <div key={group.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                  {group.name}
                </h3>
                <span className="text-[11px] text-ink-muted tabular-nums">
                  {groupCategories.length} {groupCategories.length === 1 ? 'category' : 'categories'}
                </span>
              </div>

              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupCategories.map((category) => {
                  const topics = grouped[category] ?? [];
                  return (
                    <div key={category} className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-accent-900 border-b border-border/40 pb-1">
                        {CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL] ?? category}
                      </p>
                      <ul className="space-y-0.5">
                        {topics.map((topic) => {
                          const count = counts.get(topic.slug) ?? 0;
                          return (
                            <li key={topic.slug}>
                              <Link
                                href={`/topics/${topic.slug}`}
                                className="group flex items-center justify-between rounded py-1 px-1 text-xs text-ink-muted transition-colors hover:bg-accent-50/70 hover:text-ink"
                              >
                                <span className="font-medium group-hover:underline">{topic.label}</span>
                                {count > 0 && (
                                  <span className="text-[10px] font-semibold text-accent-800 tabular-nums">
                                    {count}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
