import {
  fundedPercent,
  fundedRatio,
  remainingToTarget,
  usd,
} from "@/features/campaigns/lib/amounts";
import type { Campaign } from "@/features/campaigns/types";
import { formatMoney, type MoneyAmount } from "@/lib/money";

/**
 * The funding figures a surface is allowed to show.
 *
 * Three distinct outcomes rather than one nullable set of numbers, because
 * "we do not have the total" and "the total is zero" are different statements
 * and a crowdfunding page that renders an unindexed campaign as "$0 raised" is
 * lying. `reconciling` says the indexer is behind (NFR-08); `unavailable` says
 * there is no projection at all.
 */
export type FundingSummary =
  | {
      kind: "available";
      raised: MoneyAmount;
      target: MoneyAmount;
      remaining: MoneyAmount;
      percentFunded: number;
      ratio: number;
      backerCount: number | null;
      overTarget: boolean;
    }
  | {
      kind: "reconciling";
      target: MoneyAmount;
      backerCount: number | null;
    }
  | { kind: "unavailable"; target: MoneyAmount };

export function fundingSummary(campaign: Campaign): FundingSummary {
  const { backerCount, raised, source, target } = campaign.funding;

  if (source === "indexed" && raised !== null) {
    const percentFunded = fundedPercent(raised, target) ?? 0;

    return {
      backerCount,
      kind: "available",
      overTarget: BigInt(raised.atomic) > BigInt(target.atomic),
      percentFunded,
      raised,
      ratio: fundedRatio(raised, target) ?? 0,
      remaining: remainingToTarget(raised, target) ?? usd(0n),
      target,
    };
  }

  if (source === "reconciling") {
    return { backerCount, kind: "reconciling", target };
  }

  return { kind: "unavailable", target };
}

/**
 * The single sentence a card or hero shows under the progress bar.
 *
 * Kept here rather than in a component so a card and the detail page can never
 * describe the same campaign differently.
 */
export function fundingSummaryText(summary: FundingSummary): string {
  switch (summary.kind) {
    case "available":
      return summary.overTarget
        ? `${formatMoney(summary.raised)} raised — ${summary.percentFunded}% of ${formatMoney(summary.target)}`
        : `${formatMoney(summary.raised)} raised of ${formatMoney(summary.target)}`;
    case "reconciling":
      return `Funding figures for this campaign are being reconciled. The target is ${formatMoney(summary.target)}.`;
    case "unavailable":
      return "Funding figures are not available yet.";
  }
}

/** A backer count that never reads as a confident zero when it is unknown. */
export function backerCountText(count: number | null): string {
  if (count === null) return "Backer count unavailable";
  return count === 1 ? "1 backer" : `${count.toLocaleString("en-GB")} backers`;
}
