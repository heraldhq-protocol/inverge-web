import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StatePanel } from "@/components/ui/state-panel";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { LiveCampaignWorkspace } from "@/features/campaigns/components/live-campaign-workspace";
import { MilestoneManager } from "@/features/campaigns/components/milestone-manager";
import { getCampaignWorkspaceView } from "@/features/campaigns/server/creator";
import { getLiveCreatorCampaignView } from "@/features/campaigns/server/live-creator-campaign-detail";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";
import { isApiConfigured } from "@/lib/api/server";

type PageProps = { params: Promise<{ campaignId: string }> };

const live = () => !isPreviewAuth() && isApiConfigured();

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { campaignId } = await params;

  if (live()) {
    const result = await getLiveCreatorCampaignView(campaignId);
    return {
      description:
        "Claim a milestone: attach the evidence the campaign fixed at approval, then wait out the objection window.",
      robots: { follow: false, index: false },
      title:
        result.status === "ready"
          ? `Milestones - ${result.view.title}`
          : "Milestone worklist",
    };
  }

  const view = getCampaignWorkspaceView(campaignId);
  return {
    description:
      "Claim a milestone: attach the evidence the campaign fixed at approval, then wait out the objection window.",
    robots: { follow: false, index: false },
    title: view ? `Milestones - ${view.campaign.title}` : "Milestone worklist",
  };
}

/**
 * The milestone worklist.
 *
 * Submitting a claim never moves money on its own - approval and the objection
 * window do (FR-602) - so the screen is a claims desk, not a withdrawal button.
 * A live campaign reads the plan from the campaign endpoint; claim submission
 * still has no write surface, so it is not offered.
 */
export default async function CampaignMilestonesPage({ params }: PageProps) {
  const { campaignId } = await params;

  if (live()) {
    const result = await getLiveCreatorCampaignView(campaignId);
    if (result.status === "not_found") notFound();

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <div className="mb-5">
          <CreatorStudioTabs active="campaigns" />
        </div>
        {result.status === "ready" ? (
          <LiveCampaignWorkspace view={result.view} />
        ) : (
          <StatePanel
            variant="unavailable"
            eyebrow="Milestones"
            title={
              result.status === "signed_out"
                ? "Sign in to view milestones"
                : "Milestones are unavailable"
            }
            description={
              result.status === "signed_out"
                ? "Sign in to review the campaign you own."
                : result.reason
            }
          />
        )}
      </div>
    );
  }

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
