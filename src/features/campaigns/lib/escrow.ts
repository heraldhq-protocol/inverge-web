import { bpsOf, formatBps } from "@/features/campaigns/lib/amounts";
import type { Campaign } from "@/features/campaigns/types";
import { formatMoney } from "@/lib/money";

/**
 * The accountability story, derived from the campaign's own published terms.
 *
 * Objection windows, thresholds and the fee are read from `EscrowTerms`, so a
 * campaign that has not published one says "depends on this campaign's published
 * terms" instead of quoting a number the product does not apply. The
 * working-capital tranche is the exception: D-045 fixes it at 20% of the target
 * for every campaign, so it may be stated as a platform rule. Amounts come from
 * `funding.target` and integer basis points.
 *
 * Two requirements drive the wording and are easy to lose in a UI rewrite:
 * the working-capital tranche is released before any milestone is verified and
 * is *not* refundable (FR-503a, FR-506), and on a failed milestone only the
 * remaining escrow becomes refundable — released tranches are never clawed back.
 */

export type AccountabilityIcon =
  "evidence" | "refund" | "release" | "shield" | "target";

/**
 * Platform parameters.
 *
 * FR-505 fixes the All-or-Nothing success fee and FR-503a bounds the
 * working-capital tranche. These are Inverge's settings, not a creator's choice,
 * so authoring reads them from here to constrain and describe a draft. They stand
 * in for the settings API this build does not have: the *display* path never uses
 * them, because every sentence about a published campaign reads that campaign's
 * own `EscrowTerms` instead.
 */
export const PLATFORM_SUCCESS_FEE_BPS = 500;

/**
 * The initial working tranche is fixed at 20% of the original target (FR-503a,
 * as revised). It is not a creator choice and it does not grow when a campaign
 * overfunds. The milestone weights divide what remains after it.
 */
export const WORKING_CAPITAL_BPS = 2_000;
export const WORKING_CAPITAL_PERCENT = "20";

export type AccountabilityStep = {
  id: string;
  icon: AccountabilityIcon;
  title: string;
  body: string;
};

export function workingCapitalSentence(campaign: Campaign): string {
  const { workingCapitalBps } = campaign.escrow;

  if (workingCapitalBps === null) {
    return "Whether an early working-capital tranche is released depends on this campaign's published terms.";
  }

  const amount = bpsOf(campaign.funding.target, workingCapitalBps);

  return `On successful funding, an initial working-capital tranche of ${formatBps(workingCapitalBps)} of the original target (${formatMoney(amount)}) is released to the creator before any milestone is verified. It is a separate stage, not part of milestone one, and it does not grow when a campaign overfunds: the milestone tranches divide whatever remains after it, under the same escrow, objection and refund rules. The tranche is not eligible for refund, because the creator has already spent it.`;
}

export function objectionSentence(campaign: Campaign): string {
  const {
    objectionThresholdBps,
    objectionWindowDays,
    perWalletObjectionCapBps,
  } = campaign.escrow;

  if (objectionWindowDays === null) {
    return "The window in which backers can object to submitted evidence depends on this campaign's published terms.";
  }

  const window = `When a creator submits a milestone claim, a ${objectionWindowDays}-day objection window opens and every backer is notified.`;

  if (objectionThresholdBps === null) {
    return `${window} The objection threshold depends on this campaign's published terms.`;
  }

  const threshold = `The claim auto-approves at window close unless objections representing at least ${formatBps(objectionThresholdBps)} of contributed capital are registered.`;
  const cap =
    perWalletObjectionCapBps === null
      ? ""
      : ` Voting weight follows contribution, and any single wallet's weight is capped at ${formatBps(perWalletObjectionCapBps)}.`;

  return `${window} ${threshold}${cap}`;
}

export function failureSentence(campaign: Campaign): string {
  const { objectionThresholdBps } = campaign.escrow;

  const base =
    "If a milestone fails, only the remaining escrow for that campaign becomes refundable, claimed pro-rata by backers. Tranches already released are not clawed back.";

  if (objectionThresholdBps === null) return base;

  return `${base} A failed claim can be appealed within 72 hours, and a reviewer panel rules on the appeal within a further 72 hours.`;
}

export function successFeeSentence(campaign: Campaign): string {
  const fee = campaign.escrow.successFeeBps;

  if (fee === null) {
    return "The platform's fee on each released tranche depends on this campaign's published terms.";
  }

  return `Inverge deducts ${formatBps(fee)} of each released tranche as its fee, taken at the moment the tranche is released — including the working-capital tranche — rather than up front. It is not charged to you on top of your contribution.`;
}

/** The All-or-Nothing promise, in one place so the panel and the explainer agree. */
export function allOrNothingSentence(): string {
  return "This campaign is All-or-Nothing. If the target is not reached by the funding deadline the campaign fails, and every backer can claim a full refund without depending on the creator or on Inverge.";
}

/** The "How your contribution is used" list, in the order a backer needs it. */
export function accountabilitySteps(
  campaign: Campaign,
): readonly AccountabilityStep[] {
  return [
    {
      body: "Your contribution sits in a campaign-specific escrow account, not in the creator's account and not in Inverge's own balance.",
      icon: "shield",
      id: "escrow",
      title: "Held in escrow",
    },
    {
      body: allOrNothingSentence(),
      icon: "target",
      id: "all-or-nothing",
      title: "All-or-Nothing funding",
    },
    {
      body: `Funds are released only in the published milestone tranches, and only after that milestone's evidence is approved. ${workingCapitalSentence(campaign)}`,
      icon: "release",
      id: "staged",
      title: "Staged releases",
    },
    {
      body: `${objectionSentence(campaign)} ${failureSentence(campaign)}`,
      icon: "evidence",
      id: "objections",
      title: "Evidence and objections",
    },
    {
      body: successFeeSentence(campaign),
      icon: "refund",
      id: "fee",
      title: "Published fee",
    },
  ];
}

/** Two or three sentences for the compact rail card. */
export function escrowSummary(campaign: Campaign): string {
  const { workingCapitalBps } = campaign.escrow;
  const advance =
    workingCapitalBps === null
      ? "Any early working-capital tranche depends on the campaign's published terms."
      : `An initial working-capital tranche of ${formatBps(workingCapitalBps)} of the target is released at funding success, before any milestone is verified.`;

  return `Your contribution is held in a secure, campaign-specific escrow. If the target is not reached by the deadline you can claim a full refund. ${advance} Further releases depend on milestone approval.`;
}

export type TermRow = {
  label: string;
  value: string;
  /** True when the value states that the term is not published. */
  unknown?: boolean;
};

/** The facts a backer checks before contributing. */
export function campaignTermRows(campaign: Campaign): readonly TermRow[] {
  const { objectionWindowDays, successFeeBps, workingCapitalBps } =
    campaign.escrow;

  const workingCapitalValue =
    workingCapitalBps === null
      ? "Per published terms"
      : `${formatBps(workingCapitalBps)} of the target — released at funding, not refundable`;

  return [
    { label: "Funding model", value: "All-or-Nothing" },
    { label: "Funding asset", value: campaign.funding.fundingAsset },
    { label: "Working-capital tranche", value: workingCapitalValue },
    {
      label: "Objection window",
      value:
        objectionWindowDays === null
          ? "Per published terms"
          : `${objectionWindowDays} days after a claim`,
    },
    {
      label: "Platform fee",
      value:
        successFeeBps === null
          ? "Per published terms"
          : `${formatBps(successFeeBps)} of each released tranche`,
    },
    { label: "Funding deadline", value: campaign.funding.closesAt },
  ];
}
