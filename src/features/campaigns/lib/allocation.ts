import { bpsOf, TOTAL_BPS, usd } from "@/features/campaigns/lib/amounts";
import type { Campaign } from "@/features/campaigns/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * The staged release split for one campaign.
 *
 * FR-503a (as revised) fixes the initial working tranche at 20% of the campaign's
 * *original target*: a $1,000 campaign releases $200 whether it raises $1,000,
 * $1,500 or $2,000. The milestone weights divide what remains, so an overfunded
 * campaign keeps the surplus inside the same escrow and milestone rules. Nothing
 * here adds the initial tranche to the milestone weights; that was the old
 * same-base model and it over-paid overfunded campaigns.
 *
 * All arithmetic is integer minor units. The last milestone absorbs the
 * remainder so the split sums to `remaining` exactly, matching the programme.
 */

export type MilestoneAllocation = {
  milestoneId: string;
  weightBps: number;
  amount: MoneyAmount;
};

export type CampaignAllocation = {
  target: MoneyAmount;
  /** Null when the indexer has not reported a total; never rendered as zero. */
  raised: MoneyAmount | null;
  /** Null when the campaign has not published a working-capital figure. */
  initialTranche: MoneyAmount | null;
  /** What the milestone weights divide, after the initial tranche. */
  remaining: MoneyAmount;
  /** Raised above the target, if any. Null when the raise is unknown. */
  surplus: MoneyAmount | null;
  /** True when the raise cannot cover the fixed initial tranche. */
  insufficient: boolean;
  /** True when amounts are projections at the target, not an indexed raise. */
  projected: boolean;
  milestones: readonly MilestoneAllocation[];
};

function subtractFloor(
  amount: MoneyAmount,
  deduction: MoneyAmount,
): MoneyAmount {
  const value = BigInt(amount.atomic) - BigInt(deduction.atomic);
  return usd(value > 0n ? value : 0n);
}

/**
 * Divide `remaining` by milestone weights. Floors every share, then gives the
 * last milestone the remainder. With weights summing to 10,000 the result adds
 * up to `remaining` exactly; with a malformed plan the last row absorbs the
 * difference rather than hiding it.
 */
export function splitRemaining(
  remaining: MoneyAmount,
  milestones: readonly { id: string; allocationBps: number }[],
): readonly MilestoneAllocation[] {
  if (milestones.length === 0) return [];

  const total = BigInt(remaining.atomic);
  const shares = milestones.map(
    (milestone) =>
      (total * BigInt(Math.max(0, Math.trunc(milestone.allocationBps)))) /
      BigInt(TOTAL_BPS),
  );

  const allocated = shares.reduce((sum, share) => sum + share, 0n);
  const last = shares.length - 1;
  shares[last] = (shares[last] ?? 0n) + (total - allocated);

  return milestones.map((milestone, index) => ({
    amount: usd(shares[index] ?? 0n),
    milestoneId: milestone.id,
    weightBps: milestone.allocationBps,
  }));
}

export function allocationFor(campaign: Campaign): CampaignAllocation {
  const { raised, target } = campaign.funding;
  const workingCapitalBps = campaign.escrow.workingCapitalBps;
  const initialTranche =
    workingCapitalBps === null ? null : bpsOf(target, workingCapitalBps);
  const eligible = raised ?? target;
  const remaining =
    initialTranche === null
      ? eligible
      : subtractFloor(eligible, initialTranche);

  const surplus = raised === null ? null : subtractFloor(raised, target);

  return {
    initialTranche,
    insufficient:
      raised !== null &&
      initialTranche !== null &&
      BigInt(raised.atomic) < BigInt(initialTranche.atomic),
    milestones: splitRemaining(
      remaining,
      campaign.milestones.map((milestone) => ({
        allocationBps: milestone.allocationBps,
        id: milestone.id,
      })),
    ),
    projected: raised === null,
    raised,
    remaining,
    surplus,
    target,
  };
}
