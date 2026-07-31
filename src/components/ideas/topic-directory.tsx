import Link from 'next/link';
import { SectionHeading } from './feed-sections';
import { CATEGORY_LABEL, TOPICS } from '@/lib/feed/categories';
import type { FeedItem } from '@/lib/feed/types';

/**
 * The hand-off from the feed to the topic pages.
 *
 * The feed's own chip row filters the stream in place, which is right for a quick look but has no URL
 * and no depth: a reader who actually cares about one topic wants a page they can filter, sort, share
 * and come back to. This is the bridge, and it is why the topic pages are worth having at all.
 *
 * Counts come from the page the feed already fetched, so this costs nothing extra. They are honest about
 * what they are: how many of the ideas on this page sit in each topic, not a global total, which is why
 * a topic with none is still listed rather than silently dropped — an empty topic is an invitation to be
 * the first, and the topic page says exactly that.
 */
export function TopicDirectory({ items }: { items: FeedItem[] }) {
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

  return (
    <section aria-labelledby="browse-by-topic">
      <SectionHeading className="mb-1" id="browse-by-topic">
        Browse by topic
      </SectionHeading>
      <p className="mb-4 text-[13px] text-ink-muted">
        Each topic has its own page, where you can narrow by stage, place and how far along an idea is.
      </p>

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([category, topics]) => (
          <div key={category}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL] ?? category}
            </p>
            <ul className="space-y-0.5">
              {topics.map((topic) => {
                const count = counts.get(topic.slug) ?? 0;
                return (
                  <li key={topic.slug}>
                    <Link
                      href={`/topics/${topic.slug}`}
                      className="flex items-baseline justify-between gap-3 rounded px-1 py-1 text-sm text-ink transition-colors hover:bg-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <span>{topic.label}</span>
                      {count > 0 && (
                        <span className="shrink-0 text-xs text-ink-muted tabular-nums">{count}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
