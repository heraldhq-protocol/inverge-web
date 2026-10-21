import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { CampaignCategoryHeader } from "@/features/campaigns/components/campaign-category-header";
import { CampaignDiscovery } from "@/features/campaigns/components/campaign-discovery";
import { CampaignTrustStrip } from "@/features/campaigns/components/campaign-trust-strip";
import { defaultCampaignFilters } from "@/features/campaigns/lib/filters";
import { campaignCategories } from "@/features/campaigns/lib/taxonomy";
import { getCampaignCategoryView } from "@/features/campaigns/server/campaigns";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ categorySlug: string }> };

export function generateStaticParams() {
  return campaignCategories.map((category) => ({
    categorySlug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const view = getCampaignCategoryView(categorySlug);
  if (!view) return {};

  return buildPageMetadata({
    description: `Campaigns in ${view.category.label} on Inverge. Browse subcategories, search, and filter by status.`,
    path: `/campaigns/categories/${view.category.slug}`,
    title: `${view.category.label} campaigns`,
  });
}

/**
 * One parent category of the discovery surface.
 *
 * The route owns the category. The grid receives only this category's public
 * campaigns, and the component hides the parent control, so the heading count
 * and the result set cannot drift apart. Subcategories are real routes rather
 * than query state, which gives each one a shareable URL and a stable sitemap
 * entry.
 */
export default async function CampaignCategoryRoute({ params }: PageProps) {
  const { categorySlug } = await params;
  const view = getCampaignCategoryView(categorySlug);
  if (!view) notFound();

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
        ])}
      />
      <CampaignCategoryHeader
        category={view.category}
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
          scope={{ category: view.category, subcategory: null }}
          heading={null}
          showCategoryShortcuts={false}
          searchPlaceholder={`Search in ${view.category.label}`}
          emptyTitle={`No public campaigns in ${view.category.label} yet`}
          emptyDescription={`No campaign in ${view.category.label} matches the current search and status. Clear the filters, or browse a subcategory.`}
          nowIso={view.now}
          totalPublic={view.totalPublic}
        />
      </section>

      <CampaignTrustStrip />
    </>
  );
}
