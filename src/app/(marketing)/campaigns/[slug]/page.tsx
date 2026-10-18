import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { CampaignDetail } from "@/features/campaigns/components/campaign-detail";
import { categoryLabel } from "@/features/campaigns/lib/filters";
import {
  getCampaignDetailView,
  getPublicCampaignSlugs,
} from "@/features/campaigns/server/campaigns";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublicCampaignSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = getCampaignDetailView(slug);
  if (!view) return {};

  const { campaign } = view;

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
 */
export default async function CampaignPage({ params }: PageProps) {
  const { slug } = await params;
  const view = getCampaignDetailView(slug);
  if (!view) notFound();

  const { campaign } = view;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Campaigns", path: "/campaigns" },
          {
            name: categoryLabel(campaign.category),
            path: `/campaigns/categories/${campaign.category}`,
          },
          { name: campaign.title, path: `/campaigns/${campaign.slug}` },
        ])}
      />
      <CampaignDetail view={view} />
    </>
  );
}
