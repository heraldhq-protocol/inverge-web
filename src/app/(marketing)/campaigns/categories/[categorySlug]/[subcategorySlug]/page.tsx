import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { CampaignCategoryHeader } from "@/features/campaigns/components/campaign-category-header";
import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { CampaignTrustStrip } from "@/features/campaigns/components/campaign-trust-strip";
import { defaultCampaignFilters } from "@/features/campaigns/lib/filters";
import { campaignCategoryRoutes } from "@/features/campaigns/lib/taxonomy";
import { getCampaignCategoryView } from "@/features/campaigns/server/campaigns";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
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
  const view = getCampaignCategoryView(categorySlug, subcategorySlug);
  if (!view?.subcategory) return {};

  return buildPageMetadata({
    description: `Campaigns in ${view.subcategory.label}, part of ${view.category.label} on Inverge. Search and filter by status.`,
    path: `/campaigns/categories/${view.category.slug}/${view.subcategory.slug}`,
    title: `${view.subcategory.label} campaigns`,
  });
}

/**
 * One subcategory. An unknown child under a known parent is a 404, not an
 * empty page that looks like a real category with nothing in it.
 */
export default async function CampaignSubcategoryRoute({ params }: PageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const view = getCampaignCategoryView(categorySlug, subcategorySlug);
  if (!view?.subcategory) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Campaigns", path: "/campaigns" },
          {
            name: view.category.label,
            path: `/campaigns/categories/${view.category.slug}`,
          },
          {
            name: view.subcategory.label,
            path: `/campaigns/categories/${view.category.slug}/${view.subcategory.slug}`,
          },
        ])}
      />
      <CampaignCategoryHeader
        category={view.category}
        subcategory={view.subcategory}
        count={view.campaigns.length}
        subcategoryCounts={view.subcategoryCounts}
      />

      <section className="bg-canvas">
        <CampaignDiscovery
          candidates={view.campaigns}
          categoryCounts={view.categoryCounts}
          subcategoryCounts={{
            [view.category.slug]: view.subcategoryCounts,
          }}
          initialFilters={defaultCampaignFilters}
          scope={{ category: view.category, subcategory: view.subcategory }}
          heading={null}
          showCategoryShortcuts={false}
          searchPlaceholder={`Search in ${view.subcategory.label}`}
          emptyTitle={`No public campaigns in ${view.subcategory.label} yet`}
          emptyDescription={`No campaign in ${view.subcategory.label} matches the current search and status. Clear the filters, or browse all of ${view.category.label}.`}
          nowIso={view.now}
          totalPublic={view.totalPublic}
        />
      </section>

      <CampaignTrustStrip />
    </>
  );
}
