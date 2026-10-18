import { bpsOf, TOTAL_BPS, usd } from "@/features/campaigns/lib/amounts";
import type {
  Campaign,
  CampaignMilestone,
  MilestoneState,
} from "@/features/campaigns/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Milestone plan maths.
 *
 * The plan is the product's central claim — money moves only on approved
 * evidence — so the arithmetic that backs it (tranches, totals, what is
 * released versus pending) lives in one tested place rather than in each card.
 */

export function sortMilestones(
  milestones: readonly CampaignMilestone[],
): readonly CampaignMilestone[] {
  return [...milestones].sort((a, b) => a.sequence - b.sequence);
}

export function allocationTotalBps(
  milestones: readonly CampaignMilestone[],
): number {
  return milestones.reduce((total, item) => total + item.allocationBps, 0);
}

/**
 * A plan is complete only when it has 2–6 milestones (FR-302) and the
 * allocations are positive and sum to exactly 100%.
 */
export function isAllocationComplete(
  milestones: readonly CampaignMilestone[],
): boolean {
  if (milestones.length < 2 || milestones.length > 6) return false;
  if (milestones.some((item) => !Number.isInteger(item.allocationBps))) {
    return false;
  }
  if (milestones.some((item) => item.allocationBps <= 0)) return false;

  return allocationTotalBps(milestones) === TOTAL_BPS;
}

export function milestoneTranche(
  target: MoneyAmount,
  allocationBps: number,
): MoneyAmount {
  return bpsOf(target, allocationBps);
}

/** Which ledger column a milestone's tranche currently sits in. */
export type TrancheBucket = "refundable" | "released" | "unreleased";

export function trancheBucket(state: MilestoneState): TrancheBucket {
  switch (state) {
    case "released":
      return "released";
    case "failed":
    case "refund-available":
      return "refundable";
    case "approved":
    case "claim-submitted":
    case "disputed":
    case "objection-window":
    case "unknown":
    case "upcoming":
      return "unreleased";
  }
}

export type EscrowLedgerRow = {
  milestoneId: string;
  sequence: number;
  title: string;
  state: MilestoneState;
  allocationBps: number;
  tranche: MoneyAmount;
  bucket: TrancheBucket;
};

export type EscrowLedger = {
  target: MoneyAmount;
  rows: readonly EscrowLedgerRow[];
  released: MoneyAmount;
  /**
   * Approved and awaiting release. Kept apart from `released` so the page never
   * implies a transfer that has not happened (briefing §4).
   */
  pending: MoneyAmount;
  refundable: MoneyAmount;
  unreleased: MoneyAmount;
};

export function escrowLedger(campaign: Campaign): EscrowLedger {
  const target = campaign.funding.target;
  // A campaign that missed its target never started its plan: nothing was
  // released, and the whole raise is refundable (FR-502). Bucketing the tranches
  // by their own state would wrongly imply there is unreleased money that is not
  // refundable.
  const refundsEverything = campaign.phase === "funding-failed";

  const rows: EscrowLedgerRow[] = sortMilestones(campaign.milestones).map(
    (milestone) => ({
      allocationBps: milestone.allocationBps,
      bucket: refundsEverything ? "refundable" : trancheBucket(milestone.state),
      milestoneId: milestone.id,
      sequence: milestone.sequence,
      state: milestone.state,
      title: milestone.title,
      tranche: milestoneTranche(target, milestone.allocationBps),
    }),
  );

  const sum = (bucket: TrancheBucket) =>
    usd(
      rows
        .filter((row) => row.bucket === bucket)
        .reduce((total, row) => total + BigInt(row.tranche.atomic), 0n),
    );

  return {
    pending: approvedTotal(rows),
    refundable: sum("refundable"),
    released: sum("released"),
    rows,
    target,
    unreleased: sum("unreleased"),
  };
}

/** Approved tranches only — `released` is a separate bucket. */
function approvedTotal(rows: readonly EscrowLedgerRow[]): MoneyAmount {
  return usd(
    rows
      .filter((row) => row.state === "approved")
      .reduce((total, row) => total + BigInt(row.tranche.atomic), 0n),
  );
}

export function milestoneProgress(milestones: readonly CampaignMilestone[]): {
  released: number;
  total: number;
} {
  return {
    released: milestones.filter((item) => item.state === "released").length,
    total: milestones.length,
  };
}

/**
 * The milestone the campaign is currently working on: the first one that is not
 * finished. Null when the plan is complete or the campaign has no plan.
 */
export function currentMilestone(
  milestones: readonly CampaignMilestone[],
): CampaignMilestone | null {
  const pending = sortMilestones(milestones).find(
    (milestone) => milestone.state !== "released",
  );

  return pending ?? null;
}

/**
 * True while backers may still raise an objection (FR-602). Takes `now` so the
 * caller decides the clock and the rule stays testable.
 */
export function isObjectionOpen(
  milestone: CampaignMilestone,
  now: Date,
): boolean {
  if (milestone.state !== "objection-window") return false;
  if (milestone.objectionClosesAt === null) return false;

  return new Date(milestone.objectionClosesAt).getTime() > now.getTime();
}

/**
 * Whether an objection would carry the claim past the published threshold
 * (FR-603/FR-604). Returns null when the campaign has published no threshold.
 */
export function objectionOutcome(
  milestone: CampaignMilestone,
  thresholdBps: number | null,
): "reached" | "below" | "unknown" {
  if (thresholdBps === null) return "unknown";
  return milestone.objectionBps >= thresholdBps ? "reached" : "below";
}
