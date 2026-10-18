import { campaignCategoryCounts } from "@/features/campaigns/lib/filters";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import {
  findPreviewCampaign,
  previewCampaigns,
  viewerCampaignIds,
} from "@/features/campaigns/content/preview-campaigns";
import type { Campaign, DataSource } from "@/features/campaigns/types";
import {
  isDiscoveryCategory,
  type DiscoveryCategory,
} from "@/features/home/discovery-categories";

/**
 * Campaign reads.
 *
 * The seam every campaign surface goes through. It currently returns preview
 * fixtures and says so via `dataSource`, which is the single flag to replace when
 * the campaign API exists. Nothing above this module knows where the data came
 * from, and nothing below it decides what the UI may show.
 */

export const campaignsDataSource: DataSource = "preview";

/** Every campaign a public surface is allowed to list. */
export function allPublicCampaigns(): readonly Campaign[] {
  return previewCampaigns.filter((campaign) => isPublicPhase(campaign.phase));
}

export function getPublicCampaignSlugs(): readonly string[] {
  return allPublicCampaigns().map((campaign) => campaign.slug);
}

export function getPublicCampaignCategories(): readonly string[] {
  return Object.keys(campaignCategoryCounts(previewCampaigns));
}

/**
 * The featured campaign, or null.
 *
 * Featured is a stored editorial designation on the campaign, never inferred
 * from how well it is doing — the same reason a boosted idea carries an explicit
 * `promoted` flag rather than a derived one (FR-206a).
 */
export function getFeaturedCampaign(): Campaign | null {
  return (
    previewCampaigns.find(
      (campaign) => campaign.featured && campaign.phase === "funding",
    ) ?? null
  );
}

export type CampaignDiscoveryView = {
  dataSource: DataSource;
  /** ISO instant the server rendered at, so day counts agree on both sides. */
  now: string;
  featured: Campaign | null;
  /**
   * Every public campaign except the featured one.
   *
   * The full candidate set, not a pre-filtered slice: discovery filters on the
   * client, and handing it a subset would make a later filter change narrow
   * within the previous result instead of searching everything.
   */
  candidates: readonly Campaign[];
  categoryCounts: Readonly<Record<string, number>>;
  totalPublic: number;
};

export function getCampaignDiscoveryView(): CampaignDiscoveryView {
  const featured = getFeaturedCampaign();

  return {
    candidates: allPublicCampaigns().filter(
      (campaign) => campaign.id !== featured?.id,
    ),
    categoryCounts: campaignCategoryCounts(previewCampaigns),
    dataSource: campaignsDataSource,
    featured,
    now: new Date().toISOString(),
    totalPublic: allPublicCampaigns().length,
  };
}

export type CampaignDetailView = {
  dataSource: DataSource;
  now: string;
  campaign: Campaign;
  /** Other campaigns in the same category, for the foot of the page. */
  related: readonly Campaign[];
};

export function getCampaignDetailView(slug: string): CampaignDetailView | null {
  const campaign = findPreviewCampaign(slug);
  if (!campaign || !isPublicPhase(campaign.phase)) return null;

  return {
    campaign,
    dataSource: campaignsDataSource,
    now: new Date().toISOString(),
    related: allPublicCampaigns()
      .filter(
        (candidate) =>
          candidate.id !== campaign.id &&
          candidate.category === campaign.category,
      )
      .slice(0, 3),
  };
}

/** A creator's own campaign, whatever phase it is in. Null for anyone else's. */
export function getOwnedCampaign(id: string): Campaign | null {
  return (
    previewCampaigns.find(
      (campaign) =>
        campaign.id === id && viewerCampaignIds.includes(campaign.id),
    ) ?? null
  );
}

export type CampaignCategoryView = {
  dataSource: DataSource;
  now: string;
  category: DiscoveryCategory;
  campaigns: readonly Campaign[];
};

/**
 * A category listing.
 *
 * Members are returned unfiltered so the client discovery component can filter
 * within the category; an unknown slug returns null so the route can 404 rather
 * than render an empty page that looks like a category with no campaigns.
 */
export function getCampaignCategoryView(
  slug: string,
): CampaignCategoryView | null {
  if (!isDiscoveryCategory(slug)) return null;

  const campaigns = allPublicCampaigns().filter(
    (campaign) => campaign.category === slug,
  );

  return {
    campaigns,
    category: slug,
    dataSource: campaignsDataSource,
    now: new Date().toISOString(),
  };
}
