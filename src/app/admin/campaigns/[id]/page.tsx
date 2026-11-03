import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewAdminCampaignReviewDetail } from "@/features/campaigns/components/admin-campaign-review-detail";
import { LiveAdminCampaignDetail } from "@/features/campaigns/components/live-admin-campaign-detail";
import { AdminReviewUnavailable } from "@/features/campaigns/components/admin-review-refresh";
import { findPreviewCampaignById } from "@/features/campaigns/content/preview-campaigns";
import { getAdminCampaignDetail } from "@/features/campaigns/server/admin-campaigns";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Campaign review detail admin",
  description:
    "Review a campaign's supplied plan, approval checks, history, and decision.",
  robots: { follow: false, index: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCampaignReviewPage({ params }: PageProps) {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return null;

  const { id } = await params;
  if (access.preview) {
    const campaign = findPreviewCampaignById(id);
    if (!campaign) notFound();
    return (
      <PreviewAdminCampaignReviewDetail
        actor={access.actor}
        initialCampaign={campaign}
      />
    );
  }
  const result = await getAdminCampaignDetail(id);
  if (result.status === "not-found") notFound();
  if (result.status === "unavailable")
    return <AdminReviewUnavailable message={result.message} />;
  const campaign = result.data.campaign;
  return (
    <LiveAdminCampaignDetail
      key={`${campaign.id}:${campaign.reviewStatus}:${campaign.reviewedAt}:${campaign.submittedAt}`}
      actor={access.actor}
      detail={result.data}
    />
  );
}
