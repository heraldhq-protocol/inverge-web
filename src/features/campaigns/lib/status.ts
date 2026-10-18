import type { PillTone } from "@/components/ui/pill";
import type {
  CampaignPhase,
  CampaignPhaseFilter,
  ContributionState,
  MilestoneState,
  PaymentState,
  RefundState,
} from "@/features/campaigns/types";

/**
 * One label and one tone per lifecycle value.
 *
 * `Record<Union, …>` rather than a lookup with a fallback, so adding a state to
 * the domain model fails the typecheck until every surface has decided what it
 * says. The only fallback that exists is the deliberate `unknown` member, which
 * every union carries and which renders as "unavailable" rather than as success.
 */

export const campaignPhaseLabels: Record<CampaignPhase, string> = {
  "changes-requested": "Changes requested",
  completed: "Completed",
  delivering: "Delivering",
  draft: "Draft",
  funding: "Funding open",
  "funding-failed": "Funding failed",
  "in-review": "In review",
  paused: "Paused",
  rejected: "Not accepted",
  unknown: "Status unavailable",
};

export const campaignPhaseTones: Record<CampaignPhase, PillTone> = {
  "changes-requested": "warning",
  completed: "accent",
  delivering: "accent",
  draft: "neutral",
  funding: "accent",
  "funding-failed": "danger",
  "in-review": "warning",
  paused: "warning",
  rejected: "danger",
  unknown: "neutral",
};

/** A sentence that explains the phase's consequence, not just its name. */
export const campaignPhaseDescriptions: Record<CampaignPhase, string> = {
  "changes-requested":
    "Inverge asked the creator for changes before this campaign can be reviewed again.",
  completed: "Every milestone was approved and released.",
  delivering:
    "Funding succeeded. Contributions are held in escrow and released as milestones are approved.",
  draft: "This campaign has not been submitted for review.",
  funding:
    "Contributions are being collected. Nothing is released until the target is met and a milestone is approved.",
  "funding-failed":
    "The funding window closed below target. Backers can claim a refund.",
  "in-review":
    "Inverge is reviewing this campaign. It is not accepting contributions yet.",
  paused:
    "Inverge paused this campaign while an issue is resolved. It is not accepting contributions.",
  rejected: "Inverge did not accept this campaign for funding.",
  unknown:
    "We could not read this campaign's current status. Treat it as not accepting contributions.",
};

export const milestoneStateLabels: Record<MilestoneState, string> = {
  approved: "Approved",
  "claim-submitted": "Claim submitted",
  disputed: "Disputed",
  failed: "Claim failed",
  "objection-window": "Objection window open",
  "refund-available": "Refund available",
  released: "Funds released",
  upcoming: "Upcoming",
  unknown: "Status unavailable",
};

export const milestoneStateTones: Record<MilestoneState, PillTone> = {
  approved: "accent",
  "claim-submitted": "warning",
  disputed: "danger",
  failed: "danger",
  "objection-window": "warning",
  "refund-available": "warning",
  released: "accent",
  upcoming: "neutral",
  unknown: "neutral",
};

export const milestoneStateDescriptions: Record<MilestoneState, string> = {
  approved:
    "Backers accepted the evidence. The tranche is approved and waiting to be released.",
  "claim-submitted":
    "The creator submitted evidence. The objection window has not opened yet.",
  disputed: "A failed claim was appealed and is being reviewed.",
  failed:
    "Objections passed the threshold. This tranche was not released and is refundable.",
  "objection-window":
    "Backers can review the evidence and object. No funds move while the window is open.",
  "refund-available":
    "This tranche was not released. Backers who contributed before the milestone can claim a refund.",
  released: "The tranche was transferred to the creator.",
  upcoming: "Not started. The creator has not yet submitted evidence.",
  unknown:
    "We could not read this milestone's status. Treat it as not released.",
};

export const paymentStateLabels: Record<PaymentState, string> = {
  "awaiting-provider": "Waiting on the payment provider",
  failed: "Payment failed",
  "not-started": "Not started",
  processing: "Processing",
  "provider-unavailable": "Payment provider unavailable",
  "quote-expired": "Quote expired",
  succeeded: "Payment received",
  "user-action-required": "Your action is required",
};

export const paymentStateTones: Record<PaymentState, PillTone> = {
  "awaiting-provider": "warning",
  failed: "danger",
  "not-started": "neutral",
  processing: "warning",
  "provider-unavailable": "danger",
  "quote-expired": "danger",
  succeeded: "accent",
  "user-action-required": "warning",
};

export const contributionStateLabels: Record<ContributionState, string> = {
  confirmed: "Contribution confirmed",
  failed: "Contribution not recorded",
  none: "No contribution yet",
  pending: "Contribution pending",
  reconciling: "Being reconciled",
};

export const contributionStateTones: Record<ContributionState, PillTone> = {
  confirmed: "accent",
  failed: "danger",
  none: "neutral",
  pending: "warning",
  reconciling: "warning",
};

export const refundStateLabels: Record<RefundState, string> = {
  available: "Refund available",
  "claim-submitted": "Refund claim submitted",
  confirmed: "Refund confirmed",
  failed: "Refund attempt failed",
  "not-applicable": "Refund not applicable",
  processing: "Refund processing",
};

export const refundStateTones: Record<RefundState, PillTone> = {
  available: "warning",
  "claim-submitted": "warning",
  confirmed: "accent",
  failed: "danger",
  "not-applicable": "neutral",
  processing: "warning",
};

/**
 * What each state means, in the receipt's own words.
 *
 * A label ("Processing", "Being reconciled") tells a backer nothing about what
 * to do or expect; these sentences do. They are separate from the labels because
 * a card needs the short form and a receipt needs the consequence.
 */
export const paymentStateDescriptions: Record<PaymentState, string> = {
  "awaiting-provider":
    "The payment provider was contacted and has not responded yet. No payment has been taken.",
  failed: "The provider did not take the payment.",
  "not-started": "No payment has been started for this record.",
  processing: "The provider accepted the payment and is settling it.",
  "provider-unavailable":
    "The payment provider could not be reached, so no payment was taken.",
  "quote-expired":
    "The exchange quote for this payment expired before it was confirmed, so the settled amount is no longer known.",
  succeeded: "The provider took the payment.",
  "user-action-required":
    "The payment needs something from you — a second-factor approval, or a different method — before it can proceed.",
};

export const contributionStateDescriptions: Record<ContributionState, string> =
  {
    confirmed: "The contribution is recorded against the campaign's escrow.",
    failed: "The contribution was not recorded against the campaign's escrow.",
    none: "No escrow contribution exists for this record yet.",
    pending:
      "The contribution has been seen but is not yet recorded against the campaign's escrow.",
    reconciling:
      "Inverge is reconciling this record against the escrow index and cannot yet say what it holds.",
  };

export const refundStateDescriptions: Record<RefundState, string> = {
  available:
    "The campaign did not reach its target, so this amount can be claimed back.",
  "claim-submitted":
    "A refund claim has been submitted and is being processed.",
  confirmed: "The refund has been returned.",
  failed: "The refund attempt did not succeed and can be tried again.",
  "not-applicable": "This contribution is not in a refundable position.",
  processing: "The refund is being returned to you.",
};

/**
 * Which filter bucket a phase belongs to.
 *
 * A phase that is not shown publicly (`draft`, `in-review`,
 * `changes-requested`, `rejected`) and the `unknown` phase both map to no
 * bucket, so a public filter can never surface a listing that is not public.
 */
export function phaseFilterBucket(
  phase: CampaignPhase,
): Exclude<CampaignPhaseFilter, "all"> | null {
  switch (phase) {
    case "funding":
    case "paused":
      return "funding";
    case "delivering":
      return "live-delivery";
    case "completed":
      return "successful";
    case "funding-failed":
      return "unsuccessful";
    case "changes-requested":
    case "draft":
    case "in-review":
    case "rejected":
    case "unknown":
      return null;
  }
}

/** True when the campaign may appear on the public discovery surfaces. */
export function isPublicPhase(phase: CampaignPhase): boolean {
  return phaseFilterBucket(phase) !== null;
}

/** True when the campaign can accept a contribution right now (FR-305). */
export function acceptsContributions(phase: CampaignPhase): boolean {
  return phase === "funding";
}

/** True when the escrow ledger is worth showing: funded, in delivery, or refunding. */
export function hasEscrowActivity(phase: CampaignPhase): boolean {
  return (
    phase === "delivering" ||
    phase === "completed" ||
    phase === "funding-failed"
  );
}

/**
 * True when the milestone plan is still going to run, or already has.
 *
 * False only for a campaign that missed its target, or whose phase could not be
 * read. Cards use this to decide whether "Milestone plan" is still a promise —
 * saying it about a failed campaign would imply money is still to be released.
 */
export function planWillRun(phase: CampaignPhase): boolean {
  switch (phase) {
    case "changes-requested":
    case "completed":
    case "delivering":
    case "draft":
    case "funding":
    case "in-review":
    case "paused":
      return true;
    case "funding-failed":
    case "rejected":
    case "unknown":
      return false;
  }
}
