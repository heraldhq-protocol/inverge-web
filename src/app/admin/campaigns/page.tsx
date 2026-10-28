import type { Metadata } from "next";

import { AdminCampaignReviewQueue } from "@/features/campaigns/components/admin-campaign-review-queue";
import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Campaign review admin",
  description:
    "Submitted campaigns grouped by review state, with a reasoned decision for each one.",
  robots: { follow: false, index: false },
};

export default async function AdminCampaignsPage() {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return null;

  return <AdminCampaignReviewQueue initialCampaigns={previewCampaigns} />;
}
