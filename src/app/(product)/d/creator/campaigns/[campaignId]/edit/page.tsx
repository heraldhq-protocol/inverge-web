import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignWizard } from "@/features/campaigns/components/campaign-wizard";
import { draftFromCampaign } from "@/features/campaigns/lib/wizard";
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
 * agreed to those milestones and their evidence definitions.
 */
export default async function EditCampaignPage({ params }: PageProps) {
  const { campaignId } = await params;
  const view = getCampaignWorkspaceView(campaignId);
  if (!view) notFound();

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
        <CampaignWizard draft={draftFromCampaign(view.campaign)} mode="edit" />
      </div>
    </div>
  );
}
