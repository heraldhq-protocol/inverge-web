'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { FeedResponse } from './types';

export type FeedFilters = {
  q?: string;
  topic?: string;
  collection?: string;
  category?: string;
  take?: number;
};

/**
 * Paged feed reads.
 *
 * **Cursor is the set of ids already shown, not an offset.** Ranked scores shift between requests, so an
 * offset would silently skip or repeat items; the contract is explicit that paging is stateless and the
 * client accumulates `excludeIds` (feed-api.md). `getNextPageParam` therefore folds every id from every
 * page loaded so far into the next request.
 *
 * Filters are part of the query key, so changing the search term or topic starts a fresh sequence rather
 * than appending to the previous one.
 */
export function useFeed(filters: FeedFilters, initialPage?: FeedResponse) {
  const { q = '', topic = '', collection = '', category = '', take = 12 } = filters;

  return useInfiniteQuery<FeedResponse, Error, FeedResponse[], [string, FeedFilters], string[]>({
    queryKey: ['feed', { q, topic, collection, category, take }],
    initialPageParam: [],
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({ take: String(take) });
      if (q) params.set('q', q);
      if (topic) params.set('topic', topic);
      if (collection) params.set('collection', collection);
      if (category) params.set('category', category);
      if (pageParam.length) params.set('excludeIds', pageParam.join(','));

      const res = await fetch(`/api/feed?${params.toString()}`, { signal });
      if (!res.ok) throw new Error('Could not load more ideas');
      const text = await res.text();
      return JSON.parse(text) as FeedResponse;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      const seen = allPages.flatMap((page) => page.items.map((item) => item.id));
      return lastPage.items.length > 0 ? seen : undefined;
    },
    select: (data) => data.pages,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [[]] }
      : undefined,
    initialDataUpdatedAt: initialPage ? Date.now() : undefined,
  });
}
