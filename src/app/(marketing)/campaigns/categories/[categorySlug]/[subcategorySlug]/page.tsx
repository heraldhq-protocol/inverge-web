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
  campaignCategoryRoutes,
  findCampaignCategory,
  findCampaignSubcategory,
} from "@/features/campaigns/lib/taxonomy";
import { getCampaignCategorySurface } from "@/features/campaigns/server/category-views";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return campaignCategoryRoutes
    .filter((route) => route.subcategorySlug !== null)
    .map((route) => ({
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
    }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const category = findCampaignCategory(categorySlug);
  const subcategory = category
    ? findCampaignSubcategory(category.slug, subcategorySlug)
    : null;
  if (!category || !subcategory) return {};

  return buildPageMetadata({
    description: `Campaigns in ${subcategory.label}, part of ${category.label} on Inverge.`,
    path: `/campaigns/categories/${category.slug}/${subcategory.slug}`,
    title: `${subcategory.label} campaigns`,
  });
}

/**
 * One subcategory. An unknown child under a known parent is a 404, not an
 * empty page that looks like a real category with nothing in it.
 */
export default async function CampaignSubcategoryRoute({
  params,
  searchParams,
}: PageProps) {
  await connection();

  const [{ categorySlug, subcategorySlug }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const surface = await getCampaignCategorySurface(
    categorySlug,
    subcategorySlug,
  );
  if (!surface) notFound();

  if (surface.dataSource === "live") {
    const { view } = surface;
    const { category, subcategory } = view;
    if (!subcategory) notFound();
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
            {
              name: subcategory.label,
              path: `/campaigns/categories/${category.slug}/${subcategory.slug}`,
            },
          ])}
        />
        <CampaignCategoryHeader
          category={category}
          subcategory={subcategory}
          count={view.campaigns.length}
          subcategoryCounts={view.subcategoryCounts}
        />
        <LiveCampaignCategoryListing
          basePath={`/campaigns/categories/${category.slug}/${subcategory.slug}`}
          page={campaignPageFromParam(query.page)}
          view={view}
        />
        <CampaignTrustStrip />
      </>
    );
  }

  const { view } = surface;
  const { category, subcategory } = view;
  if (!subcategory) notFound();

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
          {
            name: subcategory.label,
            path: `/campaigns/categories/${category.slug}/${subcategory.slug}`,
          },
        ])}
      />
      <CampaignCategoryHeader
        category={category}
        subcategory={subcategory}
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
          scope={{ category, subcategory }}
          heading={null}
          showCategoryShortcuts={false}
          searchPlaceholder={`Search in ${subcategory.label}`}
          emptyTitle={`No public campaigns in ${subcategory.label} yet`}
          emptyDescription={`No campaign in ${subcategory.label} matches the current search and status. Clear the filters, or browse all of ${category.label}.`}
          nowIso={view.now}
          totalPublic={view.totalPublic}
        />
      </section>

      <CampaignTrustStrip />
    </>
  );
}
