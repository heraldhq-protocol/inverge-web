import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminCampaignReviewDetail } from "@/features/campaigns/components/admin-campaign-review-detail";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Campaign review detail admin",
  description:
    "Review one submitted campaign: pitch, milestone plan, disclosures, and decision.",
  robots: { follow: false, index: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCampaignReviewPage({ params }: PageProps) {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return null;

  const { id } = await params;
  const campaign = findPreviewCampaignById(id);
  if (!campaign) notFound();

  return (
    <AdminCampaignReviewDetail
      actor={access.actor}
      initialCampaign={campaign}
    />
  );
}
