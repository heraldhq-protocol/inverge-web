import {
  allPublicCampaigns,
  campaignsDataSource,
} from "@/features/campaigns/server/campaigns";
import type { Campaign, DataSource } from "@/features/campaigns/types";

/**
 * Saved-campaign reads.
 *
 * Saved *ids* live in the browser (see `lib/saved-campaigns.ts`), so the server
 * cannot know which campaigns a viewer saved without reading their storage. What
 * it can do is hand the client the same public campaign set every other campaign
 * surface reads from, and let the client intersect it with the saved ids. That
 * keeps a single source of campaign truth and means a saved campaign that has
 * since been unpublished simply stops resolving, which the client reports
 * instead of showing a stale record.
 */

export type SavedCampaignsView = {
  dataSource: DataSource;
  /** ISO instant the server rendered at, so deadlines agree on both sides. */
  now: string;
  candidates: readonly Campaign[];
};

export function getSavedCampaignsView(): SavedCampaignsView {
  return {
    candidates: allPublicCampaigns(),
    dataSource: campaignsDataSource,
    now: new Date().toISOString(),
  };
}
