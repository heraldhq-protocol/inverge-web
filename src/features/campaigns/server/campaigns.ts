import {
  campaignCategoryCounts,
  campaignSubcategoryCounts,
  campaignSubcategoryCountsByCategory,
} from "@/features/campaigns/lib/filters";
import { rankRelatedCampaigns } from "@/features/campaigns/lib/recommendations";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import {
  campaignCategories,
  findCampaignCategory,
  findCampaignSubcategory,
  type CampaignCategoryNode,
  type CampaignSubcategoryNode,
} from "@/features/campaigns/lib/taxonomy";
import {
  findPreviewCampaign,
  previewCampaigns,
  viewerCampaignIds,
} from "@/features/campaigns/content/preview-campaigns";
import type { Campaign, DataSource } from "@/features/campaigns/types";

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

/**
 * Categories that currently have at least one public campaign.
 *
 * The sitemap should not advertise 15 empty category pages. The category routes
 * themselves still accept every taxonomy slug, so an empty category is a valid
 * page with an honest empty state rather than a 404.
 */
export function getPublicCampaignCategories(): readonly string[] {
  const counts = campaignCategoryCounts(previewCampaigns);
  return campaignCategories
    .filter((category) => (counts[category.slug] ?? 0) > 0)
    .map((category) => category.slug);
}

/**
 * Every featured campaign that can be shown, in stored order.
 *
 * Featured is a stored editorial designation on the campaign, never inferred
 * from how well it is doing — the same reason a boosted idea carries an explicit
 * `promoted` flag rather than a derived one (FR-206a). A featured campaign that
 * is not currently funding is withheld: the band renders a funding block, and
 * there is no honest substitute for an amount that is not being raised.
 */
export function getFeaturedCampaigns(): readonly Campaign[] {
  return previewCampaigns.filter(
    (campaign) => campaign.featured && campaign.phase === "funding",
  );
}

export type CampaignDiscoveryView = {
  dataSource: DataSource;
  /** ISO instant the server rendered at, so day counts agree on both sides. */
  now: string;
  /** Every featured campaign that is currently funding, in stored order. */
  featured: readonly Campaign[];
  /**
   * Every public campaign except the featured ones.
   *
   * The full candidate set, not a pre-filtered slice: discovery filters on the
   * client, and handing it a subset would make a later filter change narrow
   * within the previous result instead of searching everything.
   */
  candidates: readonly Campaign[];
  categoryCounts: Readonly<Record<string, number>>;
  subcategoryCounts: Readonly<Record<string, Readonly<Record<string, number>>>>;
};

export function getCampaignDiscoveryView(): CampaignDiscoveryView {
  const featured = getFeaturedCampaigns();
  const featuredIds = new Set(featured.map((campaign) => campaign.id));
  const publicCampaigns = allPublicCampaigns();
  const candidates = publicCampaigns.filter(
    (campaign) => !featuredIds.has(campaign.id),
  );

  return {
    candidates,
    // Filter counts describe the grid, so they exclude the campaigns already
    // shown in the featured band. Otherwise a category chip would promise one
    // more campaign than selecting it can reveal.
    categoryCounts: campaignCategoryCounts(candidates),
    dataSource: campaignsDataSource,
    featured,
    now: new Date().toISOString(),
    subcategoryCounts: campaignSubcategoryCountsByCategory(candidates),
  };
}

export type CampaignDetailView = {
  dataSource: DataSource;
  now: string;
  campaign: Campaign;
  /** The strongest related campaigns, for the foot of the page. */
  related: readonly Campaign[];
};

export function getCampaignDetailView(slug: string): CampaignDetailView | null {
  const campaign = findPreviewCampaign(slug);
  if (!campaign || !isPublicPhase(campaign.phase)) return null;

  return {
    campaign,
    dataSource: campaignsDataSource,
    now: new Date().toISOString(),
    related: rankRelatedCampaigns(campaign, allPublicCampaigns()).slice(0, 3),
  };
}

export type CampaignRecommendationsView = {
  dataSource: DataSource;
  now: string;
  source: Campaign;
  recommendations: readonly Campaign[];
  categoryCounts: Readonly<Record<string, number>>;
  subcategoryCounts: Readonly<Record<string, Readonly<Record<string, number>>>>;
};

/**
 * The full recommended list for a campaign.
 *
 * The ranking rule lives in `lib/recommendations.ts`. This adapter only decides
 * which records are eligible: public campaigns, never the source itself. The
 * page filters and paginates the returned list on the client, exactly like the
 * discovery page.
 */
export function getCampaignRecommendationsView(
  slug: string,
): CampaignRecommendationsView | null {
  const source = findPreviewCampaign(slug);
  if (!source || !isPublicPhase(source.phase)) return null;

  const publicCampaigns = allPublicCampaigns();
  const recommendations = rankRelatedCampaigns(source, publicCampaigns);

  return {
    categoryCounts: campaignCategoryCounts(recommendations),
    dataSource: campaignsDataSource,
    now: new Date().toISOString(),
    recommendations,
    source,
    subcategoryCounts: campaignSubcategoryCountsByCategory(recommendations),
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
  category: CampaignCategoryNode;
  subcategory: CampaignSubcategoryNode | null;
  campaigns: readonly Campaign[];
  categoryCounts: Readonly<Record<string, number>>;
  subcategoryCounts: Readonly<Record<string, number>>;
  totalPublic: number;
};

/**
 * A taxonomy category or subcategory listing.
 *
 * An unknown parent or a subcategory that does not belong to it returns null so
 * the route can 404 rather than render an empty page that looks like a category
 * with no campaigns. A known but empty category is a valid page.
 */
export function getCampaignCategoryView(
  categorySlug: string,
  subcategorySlug?: string,
): CampaignCategoryView | null {
  const category = findCampaignCategory(categorySlug);
  if (!category) return null;

  const subcategory = subcategorySlug
    ? findCampaignSubcategory(category.slug, subcategorySlug)
    : null;
  if (subcategorySlug && !subcategory) return null;

  const publicCampaigns = allPublicCampaigns();
  const campaigns = publicCampaigns.filter((campaign) => {
    if (campaign.taxonomy?.category !== category.slug) return false;
    if (!subcategory) return true;
    return campaign.taxonomy.subcategory === subcategory.slug;
  });

  return {
    campaigns,
    category,
    categoryCounts: campaignCategoryCounts(publicCampaigns),
    dataSource: campaignsDataSource,
    now: new Date().toISOString(),
    subcategory,
    subcategoryCounts: campaignSubcategoryCounts(
      publicCampaigns,
      category.slug,
    ),
    totalPublic: campaigns.length,
  };
}
