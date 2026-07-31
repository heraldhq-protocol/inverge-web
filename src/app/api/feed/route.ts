import { NextResponse, type NextRequest } from 'next/server';
import { getFeed } from '@/lib/feed/feed-api';
import { CATEGORIES, type IdeaCategory } from '@/lib/feed/types';

/**
 * Feed reads for the browser.
 *
 * The client needs somewhere to page against, and it must not be the upstream API directly: the session
 * token lives in the browser, `excludeIds` grows past what a URL should carry, and pointing the client
 * at `NEXT_PUBLIC_API_URL` by hand loses the typing and the auth middleware (conventions §6.1).
 *
 * This is a thin pass-through to the same `getFeed` the server components use, so there is exactly one
 * place that knows whether the data is fixtures or live.
 */

const VALID = new Set(CATEGORIES.map((c) => c.value));

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const rawCategory = params.get('category') ?? undefined;
  const category = rawCategory && VALID.has(rawCategory as IdeaCategory)
    ? (rawCategory as IdeaCategory)
    : undefined;

  const takeParam = Number(params.get('take'));
  const take = Number.isFinite(takeParam) ? Math.min(Math.max(takeParam, 1), 50) : 12;

  const excludeIds = (params.get('excludeIds') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const feed = await getFeed({
    category,
    take,
    excludeIds,
    q: params.get('q') ?? undefined,
    topic: params.get('topic') ?? undefined,
    collection: params.get('collection') ?? undefined,
  });

  // Ranked results are per-request and personalised once a token is involved, so they are never cached.
  return NextResponse.json(feed, { headers: { 'Cache-Control': 'no-store' } });
}
