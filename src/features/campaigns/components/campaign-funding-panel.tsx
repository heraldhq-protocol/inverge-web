import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import {
  CampaignFundingCard,
  CampaignFundingRail,
} from "@/features/campaigns/components/campaign-progress";
import { CampaignShareButton } from "@/features/campaigns/components/campaign-share-button";
import {
  campaignTermRows,
  escrowSummary,
} from "@/features/campaigns/lib/escrow";
import { acceptsContributions } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";

/**
 * The compact funding bar for small screens.
 *
 * The full panel sits in a right-hand column that does not exist below `lg`, so
 * on a phone the primary action is repeated directly under the hero. Both read
 * the same figures and the same phase rules.
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
          Contribute in {campaign.funding.fundingAsset}
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
    </div>
  );
}

/**
 * The sticky funding panel.
 *
 * One primary action, decided by the campaign's actual phase rather than by what
 * would look best: contributions are only offered while the campaign is
 * genuinely accepting them. Every other phase explains itself and offers the
 * action that phase really has — tracking an existing contribution, or a refund.
 *
 * The panel shows no "Save" control, because this client has no saved-campaigns
 * data model and a button that persists nothing is a lie.
 */
export function CampaignFundingPanel({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const accepting = acceptsContributions(campaign.phase);
  const terms = campaignTermRows(campaign);

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <CampaignFundingRail campaign={campaign} nowIso={nowIso} />

        <div className="mt-5">
          {accepting ? (
            <Link
              href={`/campaigns/${campaign.slug}/back`}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Contribute in {campaign.funding.fundingAsset}
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

          <CampaignShareButton
            className="mt-2.5"
            title={`${campaign.title} on Inverge`}
          />
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-canvas p-5">
        <div className="flex items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-strong">
            <HugeiconsIcon
              icon={Shield01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h2 className="text-sm font-semibold text-ink">How escrow works</h2>
        </div>
        <p className="mt-2.5 text-sm leading-6 text-muted">
          {escrowSummary(campaign)}
        </p>
        <Link
          href="#escrow"
          className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Read the full terms
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>

        <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          {terms.map((term) => (
            <div
              key={term.label}
              className="flex items-start justify-between gap-3"
            >
              <dt className="text-muted">{term.label}</dt>
              <dd
                className={`max-w-[60%] text-right font-medium ${
                  term.unknown ? "text-muted" : "text-ink"
                }`}
              >
                {term.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
