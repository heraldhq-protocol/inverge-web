import type { Metadata } from "next";

import { CampaignWizard } from "@/features/campaigns/components/campaign-wizard";
import { emptyCampaignDraft } from "@/features/campaigns/lib/wizard";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";

export const metadata: Metadata = {
  description:
    "Draft a campaign: its plan, its milestone tranches, and the evidence each one is judged against.",
  title: "New campaign",
};

/**
 * A new campaign.
 *
 * The draft starts empty and lives only in the browser: this build has no
 * storage, so the wizard says so before a creator invests time in it.
 */
export default function NewCampaignPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Creator Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            New campaign
          </h1>
        </div>
      </div>

      <div className="mt-5">
        <CreatorStudioTabs active="campaigns" />
      </div>

      <div className="mt-7">
        <CampaignWizard draft={emptyCampaignDraft} mode="create" />
      </div>
    </div>
  );
}
