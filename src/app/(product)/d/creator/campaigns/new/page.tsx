import type { Metadata } from "next";

import { CampaignWizard } from "@/features/campaigns/components/campaign-wizard";
import { readSavedDraft } from "@/features/campaigns/lib/draft-api";
import { emptyCampaignDraft } from "@/features/campaigns/lib/wizard";
import type { DraftSaveInitial } from "@/features/campaigns/lib/use-campaign-draft-autosave";
import { readCampaignDraft } from "@/features/campaigns/server/drafts";
import { readSessionToken } from "@/features/auth/server/session";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";

export const metadata: Metadata = {
  description:
    "Draft a campaign: its plan, its milestone tranches, and the evidence each one is judged against.",
  title: "New campaign",
};

type PageProps = { searchParams: Promise<{ draft?: string }> };

/**
 * A new campaign, or a saved draft being resumed.
 *
 * `?draft=<id>` is written by the wizard on its first successful save. Loading it
 * server-side means a reload, a crashed tab or a different device continues from
 * the API's copy rather than from a client-side cache that may be stale.
 *
 * A draft that cannot be read is reported above an empty form, not silently
 * replaced: the creator should know that the link failed before retyping a plan.
 */
export default async function NewCampaignPage({ searchParams }: PageProps) {
  const { draft: draftId } = await searchParams;

  let draft = emptyCampaignDraft;
  let saved: DraftSaveInitial = null;
  let loadError: string | null = null;

  if (draftId) {
    const token = await readSessionToken();
    if (!token) {
      loadError =
        "Sign in again to load this saved draft. Nothing was changed.";
    } else {
      const result = await readCampaignDraft(token, draftId);
      if (!result.ok) {
        loadError =
          result.status === 404
            ? "That draft could not be found, or it belongs to another account. Start a new one below."
            : result.message;
      } else {
        const parsed = readSavedDraft(result.data);
        if (parsed) {
          draft = parsed.draft;
          saved = {
            id: parsed.id,
            readiness: parsed.readiness,
            version: parsed.version,
          };
        } else {
          loadError =
            "Inverge returned a draft this build cannot read. Start a new one below; the saved version is unchanged.";
        }
      }
    }
  }

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
        <CampaignWizard
          draft={draft}
          loadError={loadError}
          mode="create"
          saved={saved}
        />
      </div>
    </div>
  );
}
