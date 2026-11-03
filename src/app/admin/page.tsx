import type { Metadata } from "next";

import { AdminOverview } from "@/features/admin/components/admin-overview";
import { overviewPeriod } from "@/features/admin/lib/overview";
import { getAdminOverview } from "@/features/admin/server/overview";
import { AdminOverview as PreviewAdminOverview } from "@/features/campaigns/components/admin-overview";
import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";

export const metadata: Metadata = {
  title: "Admin overview",
  description:
    "Public platform activity, reported escrow figures, and platform analytics.",
  robots: { follow: false, index: false },
};

export default async function AdminIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { period } = await searchParams;
  const result = await getAdminOverview(overviewPeriod(period));
  if (result.status === "denied") return null;
  if (result.status === "preview") {
    return (
      <PreviewAdminOverview
        actor={result.actor}
        initialCampaigns={previewCampaigns}
      />
    );
  }

  return <AdminOverview name={result.actor.name} view={result.view} />;
}
