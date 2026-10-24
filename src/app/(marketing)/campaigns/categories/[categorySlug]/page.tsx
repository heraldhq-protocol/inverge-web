import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { JsonLd } from "@/components/shared/json-ld";
import { CampaignCategoryHeader } from "@/features/campaigns/components/campaign-category-header";
import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { CampaignTrustStrip } from "@/features/campaigns/components/campaign-trust-strip";
import { LiveCampaignCategoryListing } from "@/features/campaigns/components/live-campaign-category-listing";
import { defaultCampaignFilters } from "@/features/campaigns/lib/filters";
import { campaignPageFromParam } from "@/features/campaigns/lib/live-page";
import {
  campaignCategories,
  findCampaignCategory,
} from "@/features/campaigns/lib/taxonomy";
import { getCampaignCategorySurface } from "@/features/campaigns/server/category-views";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return campaignCategories.map((category) => ({
    categorySlug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = findCampaignCategory(categorySlug);
  if (!category) return {};

  return buildPageMetadata({
    description: `Campaigns in ${category.label} on Inverge. Browse subcategories and discover live campaign records.`,
    path: `/campaigns/categories/${category.slug}`,
    title: `${category.label} campaigns`,
  });
}

/**
 * One parent category of the discovery surface.
 *
 * The route owns the category. In preview mode the grid receives only this
 * category's fixtures and filters them in the browser. In live mode the reduced
 * API projection is rendered directly, because `GET /campaigns` cannot honour
 * the preview discovery controls.
 */
export default async function CampaignCategoryRoute({
  params,
  searchParams,
}: PageProps) {
  await connection();

  const [{ categorySlug }, query] = await Promise.all([params, searchParams]);
  const surface = await getCampaignCategorySurface(categorySlug);
  if (!surface) notFound();

  if (surface.dataSource === "live") {
    const { view } = surface;
    const category = view.category;
    return (
      <>
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Campaigns", path: "/campaigns" },
            {
              name: category.label,
              path: `/campaigns/categories/${category.slug}`,
            },
          ])}
        />
        <CampaignCategoryHeader
          category={category}
          count={view.campaigns.length}
          subcategoryCounts={view.subcategoryCounts}
        />
        <LiveCampaignCategoryListing
          basePath={`/campaigns/categories/${category.slug}`}
          page={campaignPageFromParam(query.page)}
          view={view}
        />
        <CampaignTrustStrip />
      </>
    );
  }

  const { view } = surface;
  const category = view.category;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Campaigns", path: "/campaigns" },
          {
            name: category.label,
            path: `/campaigns/categories/${category.slug}`,
          },
        ])}
      />
      <CampaignCategoryHeader
        category={category}
        count={view.campaigns.length}
        subcategoryCounts={view.subcategoryCounts}
      />

      <section className="bg-canvas">
        <CampaignDiscovery
          candidates={view.campaigns}
          categoryCounts={view.categoryCounts}
          subcategoryCounts={{
            [category.slug]: view.subcategoryCounts,
          }}
          initialFilters={defaultCampaignFilters}
          scope={{ category, subcategory: null }}
          heading={null}
          showCategoryShortcuts={false}
          searchPlaceholder={`Search in ${category.label}`}
          emptyTitle={`No public campaigns in ${category.label} yet`}
          emptyDescription={`No campaign in ${category.label} matches the current search and status. Clear the filters, or browse a subcategory.`}
          nowIso={view.now}
          totalPublic={view.totalPublic}
        />
      </section>

      <CampaignTrustStrip />
    </>
  );
}
