import { cache } from "react";

import {
  findCampaignCategory,
  findCampaignSubcategory,
  type CampaignCategoryNode,
  type CampaignSubcategoryNode,
} from "@/features/campaigns/lib/taxonomy";
import {
  getCampaignCategoryView,
  type CampaignCategoryView,
} from "@/features/campaigns/server/campaigns";
import {
  getLiveCampaignWindow,
  toLiveCampaign,
  type LiveCampaign,
} from "@/features/campaigns/server/live-campaigns";
import { isApiConfigured } from "@/lib/api/server";

export type LiveCampaignCategoryView = {
  dataSource: "live";
  now: string;
  category: CampaignCategoryNode;
  subcategory: CampaignSubcategoryNode | null;
  campaigns: readonly LiveCampaign[];
  /** Child counts within the loaded window, for this parent only. */
  subcategoryCounts: Readonly<Record<string, number>>;
  totalPublic: number;
  /** True when the 300-campaign window ended before the API ran out of rows. */
  truncated: boolean;
};

export type CampaignCategorySurface =
  | { dataSource: "preview"; view: CampaignCategoryView }
  | { dataSource: "live"; view: LiveCampaignCategoryView };

function subcategoryCountsFor(
  campaigns: readonly LiveCampaign[],
  category: CampaignCategoryNode,
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const campaign of campaigns) {
    if (campaign.taxonomyCategory !== category.slug) continue;
    if (!campaign.taxonomySubcategory) continue;
    counts[campaign.taxonomySubcategory] =
      (counts[campaign.taxonomySubcategory] ?? 0) + 1;
  }

  return counts;
}

/**
 * The category or subcategory surface a route renders.
 *
 * Fixtures are returned only when the deployment has no API at all. A
 * configured API that fails is surfaced as an error: falling back to preview
 * records would make an outage look like a campaign catalogue.
 *
 * Live cards are reduced to what `GET /campaigns` actually returns, so the live
 * page does not reuse the preview discovery grid and its client-side filters.
 */
export const getCampaignCategorySurface = cache(
  async (
    categorySlug: string,
    subcategorySlug?: string,
  ): Promise<CampaignCategorySurface | null> => {
    const category = findCampaignCategory(categorySlug);
    if (!category) return null;

    const subcategory = subcategorySlug
      ? findCampaignSubcategory(category.slug, subcategorySlug)
      : null;
    if (subcategorySlug && !subcategory) return null;

    if (!isApiConfigured()) {
      const view = getCampaignCategoryView(categorySlug, subcategorySlug);
      return view ? { dataSource: "preview", view } : null;
    }

    const window = await getLiveCampaignWindow({ category: category.slug });
    const campaigns = window.campaigns
      .map(toLiveCampaign)
      .filter((campaign): campaign is LiveCampaign => campaign !== null)
      .filter((campaign) => campaign.taxonomyCategory === category.slug);
    const visible = subcategory
      ? campaigns.filter(
          (campaign) => campaign.taxonomySubcategory === subcategory.slug,
        )
      : campaigns;

    return {
      dataSource: "live",
      view: {
        campaigns: visible,
        category,
        dataSource: "live",
        now: new Date().toISOString(),
        subcategory,
        subcategoryCounts: subcategoryCountsFor(campaigns, category),
        totalPublic: visible.length,
        truncated: window.truncated,
      },
    };
  },
);
