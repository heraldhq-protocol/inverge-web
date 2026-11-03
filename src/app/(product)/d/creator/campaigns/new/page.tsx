import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CampaignWizard } from "@/features/campaigns/components/campaign-wizard";
import { readSavedDraft } from "@/features/campaigns/lib/draft-api";
import { draftFromIdea } from "@/features/campaigns/lib/idea-conversion";
import { emptyCampaignDraft } from "@/features/campaigns/lib/wizard";
import type { DraftSaveInitial } from "@/features/campaigns/lib/use-campaign-draft-autosave";
import { readCampaignDraft } from "@/features/campaigns/server/drafts";
import { readSessionToken } from "@/features/auth/server/session";
import { getIdeaConversionSource } from "@/features/ideas/server/conversion";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";
import { getVerificationEligibility } from "@/features/verification/server/api";
import type { SubmissionGate } from "@/features/campaigns/lib/wizard";

export const metadata: Metadata = {
  description:
    "Draft a campaign: its plan, its milestone tranches, and the evidence each one is judged against.",
  title: "New campaign",
};

type PageProps = {
  searchParams: Promise<{ draft?: string; idea?: string }>;
};

/**
 * A new campaign, a saved draft being resumed, or an eligible idea being
 * converted.
 *
 * `?draft=<id>` is written by the wizard on its first successful save. Loading it
 * server-side means a reload, a crashed tab or a different device continues from
 * the API's copy rather than from a client-side cache that may be stale.
 *
 * `?idea=<id>` is the conversion entry point. The idea is resolved server-side
 * against the signed-in creator's own ideas, so the plan is prefilled only when
 * the API would actually allow the conversion. A draft that cannot be read is
 * reported above an empty form, not silently replaced: the creator should know
 * that the link failed before retyping a plan.
 */
export default async function NewCampaignPage({ searchParams }: PageProps) {
  const { draft: draftId, idea: sourceIdeaId } = await searchParams;

  let draft = emptyCampaignDraft;
  let saved: DraftSaveInitial = null;
  let loadError: string | null = null;
  let gate: SubmissionGate | null = null;
  let sourceIdea: { id: string; title: string } | null = null;
  let conversionError: string | null = null;

  const eligibility = await getVerificationEligibility("CAMPAIGN_CREATOR");
  if (eligibility.ok) {
    gate = {
      blockers: eligibility.data.blockers,
      code: eligibility.data.code,
      eligible: eligibility.data.eligible,
    };
  }

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
            applicationFee: parsed.applicationFee,
            campaignStatus: parsed.status,
            id: parsed.id,
            readiness: parsed.readiness,
            reviewStatus: parsed.reviewStatus,
            version: parsed.version,
          };
        } else {
          loadError =
            "Inverge returned a draft this build cannot read. Start a new one below; the saved version is unchanged.";
        }
      }
    }
  } else if (sourceIdeaId) {
    const source = await getIdeaConversionSource(sourceIdeaId).catch(
      () => null,
    );

    if (!source) {
      conversionError =
        "That idea could not be found, or it belongs to another account.";
    } else if (source.alreadyConvertedCampaignId) {
      redirect(
        `/d/creator/campaigns/new?draft=${encodeURIComponent(source.alreadyConvertedCampaignId)}`,
      );
    } else if (!source.canConvert) {
      conversionError =
        source.reason ?? "This idea is not eligible for a campaign yet.";
    } else {
      draft = draftFromIdea(source.idea);
      sourceIdea = { id: source.idea.id, title: source.idea.title };
    }
  }

  if (conversionError) {
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

        <div
          className="mt-7 rounded-2xl border border-warning/30 bg-warning/[0.07] p-5 text-sm leading-6 text-ink"
          role="alert"
        >
          <p className="font-bold">This idea cannot become a campaign yet</p>
          <p className="mt-1 text-muted">{conversionError}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {sourceIdeaId ? (
              <Link
                className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                href={`/ideas/${encodeURIComponent(sourceIdeaId)}`}
              >
                Back to the idea
              </Link>
            ) : null}
            <Link
              className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href="/d/creator/campaigns/new"
            >
              Start a campaign without an idea
            </Link>
          </div>
        </div>
      </div>
    );
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
          gate={gate}
          loadError={loadError}
          mode="create"
          saved={saved}
          sourceIdea={sourceIdea}
        />
      </div>
    </div>
  );
}
