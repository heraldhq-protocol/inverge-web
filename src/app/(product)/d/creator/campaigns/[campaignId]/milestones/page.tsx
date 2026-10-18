import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MilestoneManager } from "@/features/campaigns/components/milestone-manager";
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
      "Claim a milestone: attach the evidence the campaign fixed at approval, then wait out the objection window.",
    robots: { follow: false, index: false },
    title: view ? `Milestones · ${view.campaign.title}` : "Milestone worklist",
  };
}

/**
 * The milestone worklist.
 *
 * Submitting a claim never moves money on its own — approval and the objection
 * window do (FR-602) — so the screen is a claims desk, not a withdrawal button.
 */
export default async function CampaignMilestonesPage({ params }: PageProps) {
  const { campaignId } = await params;
  const view = getCampaignWorkspaceView(campaignId);
  if (!view) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="mb-5">
        <CreatorStudioTabs active="campaigns" />
      </div>
      <MilestoneManager view={view} nowIso={new Date().toISOString()} />
    </div>
  );
}
