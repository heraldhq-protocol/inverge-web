import type { Metadata } from "next";

import { PreviewAdminCampaignReviewQueue } from "@/features/campaigns/components/admin-campaign-review-queue";
import { LiveAdminCampaignQueue } from "@/features/campaigns/components/live-admin-campaign-queue";
import { AdminReviewUnavailable } from "@/features/campaigns/components/admin-review-refresh";
import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import { reviewQuery } from "@/features/campaigns/lib/admin-campaign-review";
import { getAdminCampaigns } from "@/features/campaigns/server/admin-campaigns";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Campaign review admin",
  description:
    "Submitted campaigns grouped by review state, with a reasoned decision for each one.",
  robots: { follow: false, index: false },
};

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return null;

  if (access.preview)
    return (
      <PreviewAdminCampaignReviewQueue initialCampaigns={previewCampaigns} />
    );
  const result = await getAdminCampaigns(reviewQuery(await searchParams));
  return result.status === "ready" ? (
    <LiveAdminCampaignQueue queue={result.data} />
  ) : (
    <AdminReviewUnavailable message={result.message} />
  );
}
