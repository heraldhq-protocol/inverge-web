import type { Metadata } from "next";
import { connection } from "next/server";

import { Container } from "@/components/ui/container";
import { AdSlot } from "@/features/advertising/components/ad-slot";
import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { CampaignDiscoveryHero } from "@/features/campaigns/components/campaign-discovery-hero";
import { CampaignFeaturedCarousel } from "@/features/campaigns/components/campaign-featured-carousel";
import { CampaignTrustStrip } from "@/features/campaigns/components/campaign-trust-strip";
import { LiveCampaignFeed } from "@/features/campaigns/components/live-campaign-feed";
import { parseCampaignFilters } from "@/features/campaigns/lib/filters";
import { getCampaignFeedSurface } from "@/features/campaigns/server/feed-view";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Back milestone-escrowed campaigns from African builders. Every campaign publishes a plan and its evidence before funding opens.",
  og: { eyebrow: "Campaigns", template: "marketing" },
  path: "/campaigns",
  title: "Discover campaigns",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CampaignsPage({ searchParams }: PageProps) {
  // The live catalogue is read per request; a build-time snapshot would keep
  // serving campaigns that have closed.
  await connection();

  const params = await searchParams;
  const surface = await getCampaignFeedSurface(params);

  if (surface.dataSource === "live") {
    return (
      <>
        <CampaignDiscoveryHero />
        <LiveCampaignFeed surface={surface} />
        <CampaignTrustStrip />
      </>
    );
  }

  const view = surface.view;

  return (
    <>
      <CampaignDiscoveryHero />

      <section className="bg-canvas">
        {view.featured.length > 0 ? (
          <Container className="pt-7 sm:pt-9">
            <CampaignFeaturedCarousel
              campaigns={view.featured}
              nowIso={view.now}
            />
          </Container>
        ) : null}

        <CampaignDiscovery
          candidates={view.candidates}
          categoryCounts={view.categoryCounts}
          featuredCandidates={view.featured}
          subcategoryCounts={view.subcategoryCounts}
          initialFilters={parseCampaignFilters(params)}
          nowIso={view.now}
          sponsoredSlot={
            <AdSlot
              now={view.now}
              page={{
                kind: "campaigns",
                organicResultCount: view.candidates.length,
              }}
              placementId="campaign-feed-inline"
            />
          }
          totalPublic={view.candidates.length}
        />
      </section>

      <CampaignTrustStrip />
    </>
  );
}
