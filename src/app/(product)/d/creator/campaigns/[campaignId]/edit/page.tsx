import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatePanel } from "@/components/ui/state-panel";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { CampaignWizard } from "@/features/campaigns/components/campaign-wizard";
import { draftFromCampaign } from "@/features/campaigns/lib/wizard";
import { getCampaignWorkspaceView } from "@/features/campaigns/server/creator";
import { getLiveCreatorCampaignView } from "@/features/campaigns/server/live-creator-campaign-detail";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";
import { getVerificationEligibility } from "@/features/verification/server/api";
import type { SubmissionGate } from "@/features/campaigns/lib/wizard";
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
        "Edit a campaign's story, disclosures, and terms. A published plan's milestones stay locked.",
      robots: { follow: false, index: false },
      title:
        result.status === "ready"
          ? `Edit ${result.view.title}`
          : "Edit campaign",
    };
  }

  const view = getCampaignWorkspaceView(campaignId);
  return {
    description:
      "Edit a campaign's story, disclosures, and terms. A published plan's milestones stay locked.",
    robots: { follow: false, index: false },
    title: view ? `Edit ${view.campaign.title}` : "Edit campaign",
  };
}

/**
 * Editing an existing campaign.
 *
 * The draft is built back from the campaign record so the form opens on what
 * readers actually see. The wizard locks the plan in this mode (FR-303): backers
 * agreed to those milestones and their evidence definitions. Live editing has
 * no campaign PATCH surface yet, so the page says so instead of opening a
 * preview form against a live campaign id.
 */
export default async function EditCampaignPage({ params }: PageProps) {
  const { campaignId } = await params;

  if (live()) {
    const result = await getLiveCreatorCampaignView(campaignId);
    if (result.status === "not_found") notFound();

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <div className="mb-5">
          <CreatorStudioTabs active="campaigns" />
        </div>
        <StatePanel
          variant="unavailable"
          eyebrow="Edit campaign"
          title={
            result.status === "ready"
              ? "Live campaign editing is not connected yet"
              : "Campaign unavailable"
          }
          description={
            result.status === "ready"
              ? "The API does not expose a campaign update route for this build. Your campaign is unchanged; return to the workspace to review its current state."
              : result.status === "signed_out"
                ? "Sign in to review the campaign you own."
                : result.reason
          }
          action={
            <Link
              href={`/d/creator/campaigns/${campaignId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Back to workspace
            </Link>
          }
        />
      </div>
    );
  }

  const view = getCampaignWorkspaceView(campaignId);
  if (!view) notFound();

  const eligibility = await getVerificationEligibility("CAMPAIGN_CREATOR");
  const gate: SubmissionGate | null = eligibility.ok
    ? {
        blockers: eligibility.data.blockers,
        code: eligibility.data.code,
        eligible: eligibility.data.eligible,
      }
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Creator Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Edit {view.campaign.title}
          </h1>
        </div>
      </div>

      <div className="mt-5">
        <CreatorStudioTabs active="campaigns" />
      </div>

      <div className="mt-7">
        <CampaignWizard
          draft={draftFromCampaign(view.campaign)}
          gate={gate}
          mode="edit"
        />
      </div>
    </div>
  );
}
