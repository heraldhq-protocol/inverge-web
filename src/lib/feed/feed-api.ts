import { fixtureFeedItems } from '@/lib/fixtures/ideas';
import type { FeedQuery, FeedResponse } from './types';

/**
 * The feed's only data entry point.
 *
 * `USE_FIXTURES` is the single swap: flip it and every screen reads the live ranked feed instead.
 * No component imports fixtures directly, and no component builds its own request, so the live
 * cutover cannot leak into the UI layer (brief §7.8).
 *
 * When it flips, the live call is:
 *   GET {API}/feed?type=ideas&take=…&excludeIds=a,b,c[&category=…]
 * with an optional bearer token: sent → personalised, omitted → anonymous global-popular. There is
 * no login wall on discovery, so an anonymous read is a first-class case, not an error.
 */
const USE_FIXTURES = true;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function getFeed(query: FeedQuery = {}, token?: string): Promise<FeedResponse> {
  const { type = 'ideas', take = 25, excludeIds = [], category } = query;

  if (USE_FIXTURES) {
    const exclude = new Set(excludeIds);
    let items = fixtureFeedItems().filter((i) => !exclude.has(i.id));
    if (category) items = items.filter((i) => i.category === category);
    // Items arrive in final ranked order from the server and are rendered top to bottom; the
    // fixture order stands in for that, so nothing here re-sorts.
    return { anonymous: !token, items: items.slice(0, take) };
  }

  const params = new URLSearchParams({ type, take: String(take) });
  if (excludeIds.length) params.set('excludeIds', excludeIds.join(','));
  if (category) params.set('category', category);

  const res = await fetch(`${API_URL}/feed?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
  return (await res.json()) as FeedResponse;
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
