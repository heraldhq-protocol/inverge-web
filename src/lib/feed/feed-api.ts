import { fixtureFeedItems } from '@/lib/fixtures/ideas';
import { topicFor } from './categories';
import type { FeedItem, FeedQuery, FeedResponse } from './types';

/**
 * The feed's only data entry point.
 *
 * `USE_FIXTURES` is the single swap: flip it and every screen reads the live ranked feed instead. No
 * component imports fixtures or builds its own request, so the live cutover cannot leak into the UI
 * layer (brief §7.8).
 *
 * When it flips, the live call is:
 *   GET {API}/feed?type=ideas&take=…&excludeIds=a,b,c[&category=…]
 * with an optional bearer token: sent → personalised, omitted → anonymous global-popular. Anonymous is a
 * first-class case, not an error — there is no login wall on discovery.
 *
 * **Search, topics and collections are applied here, on top of the ranked pool.** None of them exist
 * upstream: there is no search endpoint, the category enum has five values, and collections are lanes we
 * define (see categories.ts). Filtering after ranking keeps the order the ranker produced, which is the
 * only correct place to do it — re-sorting client-side would throw away the ranking.
 */
const USE_FIXTURES = true;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const DAY = 86_400_000;

function daysSincePublished(item: FeedItem): number {
  if (!item.validatingSince) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(item.validatingSince).getTime()) / DAY));
}

/** Free-text match over the fields a reader would expect to search. */
function matchesQuery(item: FeedItem, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    item.title,
    item.problem,
    item.solution,
    item.region ?? '',
    item.category,
    item.creator?.displayName ?? '',
    ...(item.topics ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

function applyCollection(items: FeedItem[], collection: string): FeedItem[] {
  switch (collection) {
    case 'closing-soon':
      return items
        .filter((i) => i.status === 'VALIDATING' && daysSincePublished(i) >= 60)
        .sort((a, b) => daysSincePublished(b) - daysSincePublished(a));
    case 'new':
      return items
        .filter((i) => daysSincePublished(i) <= 21)
        .sort((a, b) => daysSincePublished(a) - daysSincePublished(b));
    case 'threshold-met':
      return items.filter((i) => i.status === 'THRESHOLD_MET');
    case 'near-you':
      return items.filter((i) => Boolean(i.region));
    case 'well-supported':
      return [...items].sort((a, b) => b.supporterCount - a.supporterCount);
    default:
      return items;
  }
}

export async function getFeed(query: FeedQuery = {}, token?: string): Promise<FeedResponse> {
  const { type = 'ideas', take = 25, excludeIds = [], category, q, topic, collection } = query;

  if (USE_FIXTURES) {
    const exclude = new Set(excludeIds);
    let items = fixtureFeedItems().filter((i) => !exclude.has(i.id));

    if (category) items = items.filter((i) => i.category === category);

    if (topic) {
      const t = topicFor(topic);
      if (t) {
        items = items.filter(
          (i) =>
            i.category === t.category &&
            (i.topics?.includes(t.slug) ||
              t.keywords.some((k) => `${i.title} ${i.problem} ${i.solution}`.toLowerCase().includes(k)))
        );
      }
    }

    if (collection) items = applyCollection(items, collection);
    if (q) items = items.filter((i) => matchesQuery(i, q));

    const page = items.slice(0, take);
    return {
      anonymous: !token,
      items: page,
      // Stateless paging: the caller accumulates ids and sends them back. There is no offset, because
      // scores shift between requests and an offset would silently skip or repeat items.
      hasMore: items.length > page.length,
      total: items.length,
    };
  }

  const params = new URLSearchParams({ type, take: String(take) });
  if (excludeIds.length) params.set('excludeIds', excludeIds.join(','));
  if (category) params.set('category', category);

  const res = await fetch(`${API_URL}/feed?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
  const body = (await res.json()) as FeedResponse;

  // Upstream knows nothing about search, topics or collections yet, so they are applied here until it
  // does. Documented as API asks rather than hidden.
  let items = body.items;
  if (topic) {
    const t = topicFor(topic);
    if (t) items = items.filter((i) => i.category === t.category);
  }
  if (collection) items = applyCollection(items, collection);
  if (q) items = items.filter((i) => matchesQuery(i, q));

  return { ...body, items, hasMore: items.length >= take, total: items.length };
}

/** Onboarding personalization capture. Explicit preferences outrank inferred behaviour. */
export async function updateInterests(
  body: { preferredCategories?: string[]; preferredRegions?: string[] },
  token: string
): Promise<void> {
  if (USE_FIXTURES) return;
  const res = await fetch(`${API_URL}/me/interests`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Interests update failed (${res.status})`);
}
