import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { CampaignCategoryHeader } from "@/features/campaigns/components/campaign-category-header";
import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { CampaignTrustStrip } from "@/features/campaigns/components/campaign-trust-strip";
import {
  categoryLabel,
  defaultCampaignFilters,
} from "@/features/campaigns/lib/filters";
import {
  allPublicCampaigns,
  getCampaignCategoryView,
  getCampaignDiscoveryView,
  getPublicCampaignCategories,
} from "@/features/campaigns/server/campaigns";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublicCampaignCategories().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = getCampaignCategoryView(slug);
  if (!view) return {};

  const label = categoryLabel(view.category);

  return buildPageMetadata({
    description: `Campaigns raising for ${label.toLowerCase()} on Inverge, each with a published milestone plan and escrowed funding.`,
    path: `/campaigns/categories/${view.category}`,
    title: `${label} campaigns`,
  });
}

/**
 * One category of the discovery surface.
 *
 * The route sets the category, but the grid still receives *every* public
 * campaign: the filter row lets a reader move to another category or clear the
 * filter, and handing it only this category's campaigns would make that move
 * search inside an already-narrowed set.
 */
export default async function CampaignCategoryRoute({ params }: PageProps) {
  const { slug } = await params;
  const view = getCampaignCategoryView(slug);
  if (!view) notFound();

  const discovery = getCampaignDiscoveryView();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Campaigns", path: "/campaigns" },
          {
            name: categoryLabel(view.category),
            path: `/campaigns/categories/${view.category}`,
          },
        ])}
      />
      <CampaignCategoryHeader
        category={view.category}
        count={view.campaigns.length}
      />

      <section className="bg-canvas">
        <CampaignDiscovery
          candidates={allPublicCampaigns()}
          categoryCounts={discovery.categoryCounts}
          initialFilters={{
            ...defaultCampaignFilters,
            category: view.category,
          }}
          nowIso={view.now}
          totalPublic={discovery.totalPublic}
        />
      </section>

      <CampaignTrustStrip />
    </>
  );
}
