import type { Metadata } from "next";

import { AdminOverview } from "@/features/campaigns/components/admin-overview";
import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Admin overview",
  description:
    "Review queue, recent decisions, and the integration gaps still open in the admin workspace.",
  robots: { follow: false, index: false },
};

export default async function AdminIndexPage() {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return null;

  return (
    <AdminOverview actor={access.actor} initialCampaigns={previewCampaigns} />
  );
}
