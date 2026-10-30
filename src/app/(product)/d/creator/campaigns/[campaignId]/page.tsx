import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StatePanel } from "@/components/ui/state-panel";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { LiveCampaignWorkspace } from "@/features/campaigns/components/live-campaign-workspace";
import { CampaignWorkspace } from "@/features/campaigns/components/campaign-workspace";
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
        "One campaign's workspace: its review state, funding, and milestone plan.",
      robots: { follow: false, index: false },
      title:
        result.status === "ready"
          ? `${result.view.title} | Creator Studio`
          : "Campaign workspace",
    };
  }

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
 * does not own. Live auth reads the creator-readable campaign endpoint; preview
 * auth keeps the fixture workspace.
 */
export default async function CampaignWorkspacePage({ params }: PageProps) {
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
            eyebrow="Campaign"
            title={
              result.status === "signed_out"
                ? "Sign in to view this campaign"
                : "Campaign workspace unavailable"
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
      <CampaignWorkspace view={view} />
    </div>
  );
}
