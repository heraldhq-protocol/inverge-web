import type { Campaign } from "@/features/campaigns/types";

/**
 * Load-more pagination over an already-filtered, already-sorted result.
 *
 * The preview has the full result set in memory, so "page" means how many rows
 * the reader has chosen to reveal, not an offset sent to a server. The helper
 * is deliberately separate from the component: when the campaigns API lands,
 * the same visible-count contract can drive a real cursor without changing the
 * copy or the progress semantics.
 *
 * `visibleCampaigns` also deduplicates by campaign id. Overlapping pages are a
 * normal cursor bug, and a repeated key is a worse failure than a short page.
 */
export const CAMPAIGN_PAGE_SIZE = 6;

export function visibleCampaigns(
  campaigns: readonly Campaign[],
  visibleCount: number,
): readonly Campaign[] {
  const limit = Math.max(0, Math.floor(visibleCount));
  const seen = new Set<string>();
  const visible: Campaign[] = [];

  for (const campaign of campaigns.slice(0, limit)) {
    if (seen.has(campaign.id)) continue;
    seen.add(campaign.id);
    visible.push(campaign);
  }

  return visible;
}

export function hasMoreCampaigns(total: number, visibleCount: number): boolean {
  return visibleCount < total;
}

/**
 * The progress copy. `total` is always known for this local query; a future
 * server page without a reliable total must pass `null` and the component
 * shows the loaded count only, never a fabricated percentage.
 */
export function viewedLabel(loaded: number, total: number | null): string {
  if (total === null) {
    return loaded === 1
      ? "You’ve viewed 1 campaign"
      : `You’ve viewed ${loaded} campaigns`;
  }

  return `You’ve viewed ${loaded} of ${total} ${
    total === 1 ? "campaign" : "campaigns"
  }`;
}

export function nextVisibleCount(
  current: number,
  pageSize = CAMPAIGN_PAGE_SIZE,
): number {
  return Math.max(0, current) + Math.max(1, pageSize);
}
