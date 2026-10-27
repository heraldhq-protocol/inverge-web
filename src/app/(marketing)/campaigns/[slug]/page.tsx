import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { JsonLd } from "@/components/shared/json-ld";
import { CampaignDetail } from "@/features/campaigns/components/campaign-detail";
import { LiveCampaignDetailPage } from "@/features/campaigns/components/live-campaign-detail";
import {
  campaignTabsFor,
  resolveCampaignTab,
} from "@/features/campaigns/lib/campaign-tabs";
import {
  campaignCategoryHref,
  campaignTaxonomyText,
} from "@/features/campaigns/lib/filters";
import { getPublicCampaignSlugs } from "@/features/campaigns/server/campaigns";
import { getCampaignDetailSurface } from "@/features/campaigns/server/campaign-surfaces";
import { isApiConfigured } from "@/lib/api/server";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Preview fixtures have predictable slugs, so they can be pre-rendered. A live
 * catalogue cannot: listing fixture slugs here would ship pages for campaigns
 * the API does not have and omit the ones it does.
 */
export function generateStaticParams() {
  if (isApiConfigured()) return [];
  return getPublicCampaignSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const surface = await getCampaignDetailSurface(slug);
  if (!surface) return {};

  const { campaign } = surface.view;

  return buildPageMetadata({
    description: campaign.summary,
    og: { eyebrow: "Campaign", template: "marketing" },
    path: `/campaigns/${campaign.slug}`,
    title: campaign.title,
  });
}

/**
 * A public campaign.
 *
 * The campaign is resolved through the same seam the discovery grid uses and is
 * 404'd when it is not publicly readable, so a draft, a rejected listing, or an
 * unlisted id renders the not-found page rather than a half-populated campaign.
 *
 * Preview deployments render the editorial fixture page unchanged. An API-backed
 * deployment renders the live record and only the sections that record actually
 * has; it never falls back to a fixture when the API answers 404.
 *
 * The tab is resolved here rather than in the client so the first paint already
 * shows the right panel: a shared `?tab=rewards` link renders the rewards, not
 * the story followed by a swap. An unknown or unavailable tab falls back to the
 * campaign's first tab instead of erroring.
 */
export default async function CampaignPage({
  params,
  searchParams,
}: PageProps) {
  if (isApiConfigured()) await connection();

  const { slug } = await params;
  const surface = await getCampaignDetailSurface(slug);
  if (!surface) notFound();

  const requested = (await searchParams).tab;
  const requestedTab = Array.isArray(requested) ? requested[0] : requested;

  if (surface.dataSource === "live") {
    const { campaign } = surface.view;

    return (
      <>
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Campaigns", path: "/campaigns" },
            ...(campaign.taxonomyCategory
              ? [
                  {
                    name: campaign.taxonomyText,
                    path: `/campaigns/categories/${campaign.taxonomyCategory}`,
                  },
                ]
              : []),
            { name: campaign.title, path: `/campaigns/${campaign.slug}` },
          ])}
        />
        <LiveCampaignDetailPage
          requestedTab={requestedTab}
          view={surface.view}
        />
      </>
    );
  }

  const { campaign } = surface.view;
  const activeTab = resolveCampaignTab(requestedTab, campaignTabsFor(campaign));
  const categoryHref = campaignCategoryHref(campaign);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Campaigns", path: "/campaigns" },
          ...(categoryHref
            ? [{ name: campaignTaxonomyText(campaign), path: categoryHref }]
            : []),
          { name: campaign.title, path: `/campaigns/${campaign.slug}` },
        ])}
      />
      <CampaignDetail activeTab={activeTab} view={surface.view} />
    </>
  );
}
