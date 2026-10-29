import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import {
  CampaignFundingCard,
  CampaignFundingRail,
} from "@/features/campaigns/components/campaign-progress";
import { CampaignSaveButton } from "@/features/campaigns/components/campaign-save-button";
import { CampaignShareButton } from "@/features/campaigns/components/campaign-share-button";
import { PhasePill } from "@/features/campaigns/components/campaign-status-pill";
import { campaignTabHref } from "@/features/campaigns/lib/campaign-tabs";
import { allOrNothingSentence } from "@/features/campaigns/lib/escrow";
import { SAVED_CAMPAIGNS_SHORT_NOTE } from "@/features/campaigns/lib/saved-campaigns";
import { campaignSharePayload } from "@/features/campaigns/lib/share";
import { acceptsContributions } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";

/** The save control, reduced to the two fields the store actually needs. */
function saveTarget(campaign: Campaign) {
  return { id: campaign.id, slug: campaign.slug };
}

/**
 * The compact funding bar for small screens.
 *
 * The full panel sits in a right-hand column that does not exist below `lg`, so
 * on a phone the primary action is repeated directly under the hero, along with
 * the same save and share controls. Both read the same figures, the same
 * lifecycle rules, and the same share payload.
 */
export function CampaignMobileFundingBar({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const accepting = acceptsContributions(campaign.phase);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <CampaignFundingCard campaign={campaign} nowIso={nowIso} />

      {accepting ? (
        <Link
          href={`/campaigns/${campaign.slug}/back`}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back this campaign
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      ) : (
        <Link
          href="/d/backing"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {campaign.phase === "funding-failed"
            ? "See refund options"
            : "Track contributions you back"}
        </Link>
      )}

      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <CampaignSaveButton campaign={saveTarget(campaign)} />
        <CampaignShareButton
          label="Share"
          payload={campaignSharePayload(campaign)}
        />
      </div>

      <p className="mt-2 text-xs leading-5 text-muted">
        {SAVED_CAMPAIGNS_SHORT_NOTE}
      </p>
    </div>
  );
}

/**
 * The funding card, and the head of the rail.
 *
 * One primary action, decided by the campaign's actual phase rather than by what
 * would look best: contributions are only offered while the campaign is
 * genuinely accepting them. Every other phase explains itself and offers the
 * action that phase really has — tracking an existing contribution, or a refund.
 *
 * Save and share sit beside the primary action. Save writes to this browser only
 * and says so; share hands the canonical URL to the platform share sheet, with a
 * clipboard fallback. Neither claims more than it did.
 *
 * The phase pill and the preview chip are the card's first line, because the
 * single question a rail has to answer before its figures is whether this
 * campaign can take money at all, and whether those figures are real. This build
 * has no API and no wallet, so the chip stays.
 *
 * The All-or-Nothing note closes the card. It is the model a backer is agreeing
 * to, so it belongs with the amount rather than behind a tab.
 */
export function CampaignFundingPanel({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const accepting = acceptsContributions(campaign.phase);
  const escrowHref = campaignTabHref(campaign.slug, "facts");

  return (
    <div>
      <section
        aria-labelledby="funding-panel-heading"
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            className="text-sm font-semibold tracking-[-0.01em] text-ink"
            id="funding-panel-heading"
          >
            Campaign funding
          </h2>
          <span className="flex shrink-0 items-center gap-1.5">
            <PhasePill phase={campaign.phase} size="xs" />
          </span>
        </div>

        <div className="mt-3.5">
          <CampaignFundingRail campaign={campaign} nowIso={nowIso} />
        </div>

        <div className="mt-5">
          {accepting ? (
            <Link
              href={`/campaigns/${campaign.slug}/back`}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Back this campaign
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          ) : (
            <div className="rounded-xl border border-border bg-canvas px-4 py-3">
              <p className="text-sm leading-6 text-muted">
                {campaign.phase === "funding-failed"
                  ? "The funding window closed below target. Backers can claim a full refund."
                  : "This campaign is not accepting contributions right now."}
              </p>
              <Link
                href="/d/backing"
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {campaign.phase === "funding-failed"
                  ? "See refund options"
                  : "Track contributions you back"}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={15}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}

          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <CampaignSaveButton campaign={saveTarget(campaign)} />
            <CampaignShareButton
              label="Share"
              payload={campaignSharePayload(campaign)}
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-muted">
            {SAVED_CAMPAIGNS_SHORT_NOTE}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-brand/25 bg-brand/6 p-3.5">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Shield01Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
              className="text-brand-strong"
            />
            <h3 className="text-sm font-semibold text-ink">All-or-Nothing</h3>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted">
            {allOrNothingSentence()}
          </p>
          <Link
            className="mt-2 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={escrowHref}
          >
            How escrow releases the money
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
