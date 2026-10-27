import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";

import { JsonLd } from "@/components/shared/json-ld";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatePanel } from "@/components/ui/state-panel";
import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { CampaignBreadcrumbs } from "@/features/campaigns/components/campaign-breadcrumbs";
import { CampaignRecommendationsHeader } from "@/features/campaigns/components/campaign-recommendations-header";
import { CampaignTrustStrip } from "@/features/campaigns/components/campaign-trust-strip";
import { LiveCampaignCard } from "@/features/campaigns/components/live-campaign-card";
import { parseCampaignFilters } from "@/features/campaigns/lib/filters";
import { recommendationReason } from "@/features/campaigns/lib/recommendations";
import { getPublicCampaignSlugs } from "@/features/campaigns/server/campaigns";
import { getCampaignRecommendationsSurface } from "@/features/campaigns/server/campaign-surfaces";
import type { LiveCampaign } from "@/features/campaigns/server/live-campaigns";
import { isApiConfigured } from "@/lib/api/server";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  if (isApiConfigured()) return [];
  return getPublicCampaignSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const surface = await getCampaignRecommendationsSurface(slug);
  if (!surface) return {};

  const source = surface.view.source;

  return buildPageMetadata({
    description: `Campaigns related to ${source.title} on Inverge, ordered by shared subcategory, then open campaigns, then the nearest deadline.`,
    path: `/campaigns/${source.slug}/recommended`,
    title: `Recommended after ${source.title}`,
  });
}

function LiveRecommendations({
  recommendations,
  slug,
  source,
  state,
}: {
  recommendations: readonly LiveCampaign[];
  slug: string;
  source: string;
  state: "live" | "unavailable";
}) {
  return (
    <section className="bg-canvas">
      <Container className="py-9 sm:py-12">
        <CampaignBreadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/campaigns", label: "Campaigns" },
            { href: `/campaigns/${encodeURIComponent(slug)}`, label: source },
            { label: "Recommended" },
          ]}
        />

        <Eyebrow>Recommended</Eyebrow>
        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
          More campaigns you might like
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Ordered by shared subcategory, then open campaigns, then the nearest
          deadline. This is a deterministic rule over public records, not a
          behavioural score or a paid placement.
        </p>

        <div className="mt-7">
          {state === "unavailable" ? (
            <StatePanel
              action={
                <Link
                  href={`/campaigns/${encodeURIComponent(slug)}/recommended`}
                  className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Try again
                </Link>
              }
              description="The campaign is still available, but the related-campaign list could not be loaded. Nothing was inferred from the failure."
              eyebrow="Unavailable"
              title="Recommendations could not load"
              variant="error"
            />
          ) : recommendations.length === 0 ? (
            <StatePanel
              action={
                <Link
                  href="/campaigns"
                  className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Browse all campaigns
                </Link>
              }
              description="There are no other public campaigns in this category yet. Browse the full catalogue to see what else is open."
              eyebrow="No matches"
              title="No recommendations yet"
              variant="empty"
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((campaign) => (
                <li key={campaign.id} className="h-full">
                  <LiveCampaignCard campaign={campaign} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}

/**
 * The full recommendation list for one campaign.
 *
 * The detail page shows the first three. This route exists so "See more" goes
 * somewhere real and so the full list can be shared without inventing a
 * personalised feed. Live recommendations describe their deterministic rule;
 * a failed related read is shown as unavailable, never as an empty list.
 */
export default async function CampaignRecommendationsRoute({
  params,
  searchParams,
}: PageProps) {
  if (isApiConfigured()) await connection();

  const { slug } = await params;
  const surface = await getCampaignRecommendationsSurface(slug);
  if (!surface) notFound();

  if (surface.dataSource === "live") {
    const { recommendations, source, state } = surface.view;

    return (
      <>
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Campaigns", path: "/campaigns" },
            {
              name: source.title,
              path: `/campaigns/${source.slug}`,
            },
            {
              name: "Recommended",
              path: `/campaigns/${source.slug}/recommended`,
            },
          ])}
        />
        <LiveRecommendations
          recommendations={recommendations}
          slug={source.slug}
          source={source.title}
          state={state}
        />
        <CampaignTrustStrip />
      </>
    );
  }

  const view = surface.view;
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
