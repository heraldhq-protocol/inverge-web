import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { CampaignRecommendationsHeader } from "@/features/campaigns/components/campaign-recommendations-header";
import { CampaignTrustStrip } from "@/features/campaigns/components/campaign-trust-strip";
import { parseCampaignFilters } from "@/features/campaigns/lib/filters";
import { recommendationReason } from "@/features/campaigns/lib/recommendations";
import {
  getCampaignRecommendationsView,
  getPublicCampaignSlugs,
} from "@/features/campaigns/server/campaigns";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return getPublicCampaignSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = getCampaignRecommendationsView(slug);
  if (!view) return {};

  return buildPageMetadata({
    description: `Campaigns related to ${view.source.title} on Inverge, ordered by shared subcategory, category, and editorial feature.`,
    path: `/campaigns/${view.source.slug}/recommended`,
    title: `Recommended after ${view.source.title}`,
  });
}

/**
 * The full recommendation list for one campaign.
 *
 * The detail page shows the first three. This route exists so "See more" goes
 * somewhere real and so the full list can be searched, filtered, and shared
 * without inventing a personalised feed.
 */
export default async function CampaignRecommendationsRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const view = getCampaignRecommendationsView(slug);
  if (!view) notFound();
  const filters = parseCampaignFilters(await searchParams);
  const recommendationReasons = Object.fromEntries(
    view.recommendations.map((campaign) => [
      campaign.id,
      recommendationReason(view.source, campaign),
    ]),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Campaigns", path: "/campaigns" },
          {
            name: view.source.title,
            path: `/campaigns/${view.source.slug}`,
          },
          {
            name: "Recommended",
            path: `/campaigns/${view.source.slug}/recommended`,
          },
        ])}
      />
      <CampaignRecommendationsHeader source={view.source} />

      <section className="bg-canvas">
        <CampaignDiscovery
          candidates={view.recommendations}
          categoryCounts={view.categoryCounts}
          subcategoryCounts={view.subcategoryCounts}
          initialFilters={filters}
          heading="Recommended campaigns"
          description={
            view.recommendations.length === 1
              ? "1 related public campaign."
              : `${view.recommendations.length} related public campaigns.`
          }
          searchPlaceholder="Search recommendations"
          emptyTitle="No recommendations yet"
          emptyDescription="There are no other public campaigns to recommend yet. Browse all campaigns to see what else is open."
          nowIso={view.now}
          recommendationReasons={recommendationReasons}
          totalPublic={view.recommendations.length}
        />
      </section>

      <CampaignTrustStrip />
    </>
  );
}
