import { cache } from "react";

import {
  getCampaignDetailView,
  getCampaignRecommendationsView,
  type CampaignDetailView,
  type CampaignRecommendationsView,
} from "@/features/campaigns/server/campaigns";
import {
  getLiveCampaignDetail,
  getLiveCampaignRecommendations,
  type LiveCampaignDetailView,
  type LiveCampaignRecommendationsView,
} from "@/features/campaigns/server/live-campaign-detail";
import {
  getLiveCampaignPage,
  type LiveCampaign,
} from "@/features/campaigns/server/live-campaigns";
import { isApiConfigured } from "@/lib/api/server";

/**
 * The campaign route's data, selected once per request.
 *
 * Preview fixtures are used only when this deployment has no API configured.
 * With an API, a campaign that does not resolve publicly is `null` and the route
 * 404s - it never falls back to a fixture that happens to share a slug. A failed
 * API read throws, so the campaign error boundary can offer a retry instead of
 * presenting an outage as an empty campaign.
 */
export type CampaignDetailSurface =
  | { dataSource: "preview"; view: CampaignDetailView }
  | { dataSource: "live"; view: LiveCampaignDetailView };

export type CampaignRecommendationsSurface =
  | { dataSource: "preview"; view: CampaignRecommendationsView }
  | { dataSource: "live"; view: LiveCampaignRecommendationsView };

export const getCampaignDetailSurface = cache(
  async (slug: string): Promise<CampaignDetailSurface | null> => {
    if (!isApiConfigured()) {
      const view = getCampaignDetailView(slug);
      return view ? { dataSource: "preview", view } : null;
    }

    const view = await getLiveCampaignDetail(slug);
    return view ? { dataSource: "live", view } : null;
  },
);

export const getCampaignRecommendationsSurface = cache(
  async (slug: string): Promise<CampaignRecommendationsSurface | null> => {
    if (!isApiConfigured()) {
      const view = getCampaignRecommendationsView(slug);
      return view ? { dataSource: "preview", view } : null;
    }

    const view = await getLiveCampaignRecommendations(slug);
    return view ? { dataSource: "live", view } : null;
  },
);

/**
 * Campaigns a sitemap may advertise.
 *
 * Bounded to `max` records so a large catalogue cannot turn the sitemap into an
 * unbounded crawl of the API. The caller derives canonical paths from the same
 * records, so an entry and a reachable page cannot disagree.
 */
export async function getLiveCampaignsForSitemap(
  max = 500,
): Promise<LiveCampaign[]> {
  const campaigns: LiveCampaign[] = [];
  let cursor: string | null = null;

  while (campaigns.length < max) {
    const page = await getLiveCampaignPage({
      cursor,
      limit: Math.min(50, max - campaigns.length),
      sort: "newest",
    });
    campaigns.push(...page.campaigns);
    cursor = page.nextCursor;
    if (!page.hasMore || !cursor || page.campaigns.length === 0) break;
  }

  return campaigns;
}

export type { LiveCampaign };
