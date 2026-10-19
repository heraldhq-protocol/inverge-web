import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignBackPage } from "@/features/campaigns/components/campaign-back-page";
import { getCampaignDetailView } from "@/features/campaigns/server/campaigns";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = getCampaignDetailView(slug);
  if (!view) return {};

  return buildPageMetadata({
    description: `Preview how contributing to ${view.campaign.title} works, step by step.`,
    path: `/campaigns/${view.campaign.slug}/back`,
    robots: "noindex",
    title: `Contribute to ${view.campaign.title}`,
  });
}

/**
 * The contribution flow for one campaign.
 *
 * Only campaigns a backer could actually contribute to are reachable: the same
 * public-phase check that gates the detail page gates this one, so a campaign
 * that has closed cannot be linked into a contribution.
 */
export default async function CampaignBackRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { tier } = await searchParams;
  const view = getCampaignDetailView(slug);
  if (!view) notFound();

  return (
    <CampaignBackPage
      campaign={view.campaign}
      initialTierId={typeof tier === "string" ? tier : null}
    />
  );
}
