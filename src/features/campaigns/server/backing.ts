import {
  findPreviewContribution,
  previewContributions,
} from "@/features/campaigns/content/preview-contributions";
import { contributionNeedsAction } from "@/features/campaigns/lib/backing";
import { campaignsDataSource } from "@/features/campaigns/server/campaigns";
import type { Contribution, DataSource } from "@/features/campaigns/types";
import { sumMoneyAmounts, type MoneyAmount } from "@/lib/money";

/**
 * Backer reads.
 *
 * The backing history and its receipt. Totals are derived from the same records
 * the list renders, so a headline figure and the row that justifies it can never
 * disagree. A refund only counts as refundable once the record says the refund
 * is actually available, and only ever at the eligible amount.
 */

export type BackingView = {
  dataSource: DataSource;
  contributions: readonly Contribution[];
  totals: {
    /** Money the provider actually took. `succeeded` only. */
    contributed: MoneyAmount;
    /** Claimable now. */
    refundable: MoneyAmount;
    /** Already returned. */
    refunded: MoneyAmount;
  };
  /** Records that still need the backer's attention. */
  needsAttention: number;
};

function emptyMoney(): MoneyAmount {
  return { atomic: "0", currency: "USD", decimals: 2 };
}

/** Newest first, so the history reads like a statement. */
export function sortedContributions(
  contributions: readonly Contribution[],
): readonly Contribution[] {
  return [...contributions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
}

export function getBackingView(): BackingView {
  const contributions = sortedContributions(previewContributions);

  const succeeded = contributions.filter(
    (item) => item.payment.state === "succeeded",
  );

  const contributed =
    succeeded.length === 0
      ? emptyMoney()
      : sumMoneyAmounts(succeeded.map((item) => item.amount));

  const refundable = sumMoneyAmounts(
    contributions
      .filter((item) => item.refund.state === "available")
      .map((item) => item.refund.eligibleAmount)
      .filter((amount): amount is MoneyAmount => amount !== null),
  );

  const refunded = sumMoneyAmounts(
    contributions
      .filter((item) => item.refund.state === "confirmed")
      .map((item) => item.refund.eligibleAmount)
      .filter((amount): amount is MoneyAmount => amount !== null),
  );

  return {
    contributions,
    dataSource: campaignsDataSource,
    needsAttention: contributions.filter(contributionNeedsAction).length,
    totals: { contributed, refundable, refunded },
  };
}

export type ContributionReceiptView = {
  dataSource: DataSource;
  contribution: Contribution;
};

export function getContributionReceiptView(
  id: string,
): ContributionReceiptView | null {
  const contribution = findPreviewContribution(id);
  if (!contribution) return null;

  return { contribution, dataSource: campaignsDataSource };
}
