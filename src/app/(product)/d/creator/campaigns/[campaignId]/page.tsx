import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignWorkspace } from "@/features/campaigns/components/campaign-workspace";
import { getCampaignWorkspaceView } from "@/features/campaigns/server/creator";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";

type PageProps = { params: Promise<{ campaignId: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { campaignId } = await params;
  const view = getCampaignWorkspaceView(campaignId);

  return {
    description:
      "One campaign's workspace: its review state, funding, escrow position, and milestone plan.",
    robots: { follow: false, index: false },
    title: view
      ? `${view.campaign.title} | Creator Studio`
      : "Campaign workspace",
  };
}

/**
 * One campaign's workspace.
 *
 * The view resolves the id against the account's own campaigns and returns null
 * for anything else, so a hand-edited URL cannot reach a campaign this creator
 * does not own.
 */
export default async function CampaignWorkspacePage({ params }: PageProps) {
  const { campaignId } = await params;
  const view = getCampaignWorkspaceView(campaignId);
  if (!view) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="mb-5">
        <CreatorStudioTabs active="campaigns" />
      </div>
      <CampaignWorkspace view={view} />
    </div>
  );
}
