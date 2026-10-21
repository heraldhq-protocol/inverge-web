import type { Contribution, RefundState } from "@/features/campaigns/types";
import type { WalletRefund } from "@/features/wallet/types";
import { sumMoneyAmounts, type MoneyAmount } from "@/lib/money";

/**
 * Refund records, read from the contributions that produced them.
 *
 * Refund eligibility is a campaign outcome, not a wallet action. The wallet
 * surface may show what is claimable and what has been returned; it may not
 * decide that a refund is due, and it may not claim one while no refund service
 * exists.
 */

export type WalletRefundSummary = {
  refunds: readonly WalletRefund[];
  refundable: MoneyAmount;
  inProgress: MoneyAmount;
  refunded: MoneyAmount;
  needsAttention: number;
};

function money(atomic: string): MoneyAmount {
  return { atomic, currency: "USD", decimals: 2 };
}

export function refundsFromContributions(
  contributions: readonly Contribution[],
): readonly WalletRefund[] {
  return contributions
    .filter((contribution) => contribution.refund.state !== "not-applicable")
    .map((contribution) => {
      const refund = contribution.refund;

      return {
        campaignSlug: contribution.campaignSlug,
        campaignTitle: contribution.campaignTitle,
        claimSubmittedAt: refund.claimSubmittedAt,
        confirmedAt: refund.confirmedAt,
        contributionId: contribution.id,
        eligibleAmount:
          refund.eligibleAmount ?? money(contribution.amount.atomic),
        id: `refund-${contribution.id}`,
        reason: refund.reason,
        state: refund.state,
        transaction: refund.transaction
          ? {
              network: refund.transaction.network,
              signature: refund.transaction.signature,
            }
          : null,
      };
    })
    .sort((a, b) => {
      const aDate = a.confirmedAt ?? a.claimSubmittedAt ?? "";
      const bDate = b.confirmedAt ?? b.claimSubmittedAt ?? "";
      return bDate.localeCompare(aDate);
    });
}

function sumFor(
  refunds: readonly WalletRefund[],
  states: readonly RefundState[],
): MoneyAmount {
  const amounts = refunds
    .filter((refund) => states.includes(refund.state))
    .map((refund) => refund.eligibleAmount);

  return amounts.length === 0 ? money("0") : sumMoneyAmounts(amounts);
}

export function summariseRefunds(
  refunds: readonly WalletRefund[],
): WalletRefundSummary {
  return {
    inProgress: sumFor(refunds, ["claim-submitted", "processing"]),
    needsAttention: refunds.filter(
      (refund) => refund.state === "available" || refund.state === "failed",
    ).length,
    refundable: sumFor(refunds, ["available"]),
    refunded: sumFor(refunds, ["confirmed"]),
    refunds,
  };
}

export type RefundActionAvailability = {
  canRequest: boolean;
  label: string;
  reason: string | null;
};

/**
 * What the backer could do from a refund record once a service is connected.
 *
 * `canRequest` is about the record's state only. Whether execution is possible
 * is a separate capability, so this function can never make an unavailable
 * service look usable.
 */
export function refundActionAvailability(
  state: RefundState,
): RefundActionAvailability {
  switch (state) {
    case "available":
      return {
        canRequest: true,
        label: "Claim refund",
        reason: null,
      };
    case "failed":
      return {
        canRequest: true,
        label: "Try the refund again",
        reason:
          "The previous attempt failed. A retry needs the refund service, which is not connected in this build.",
      };
    case "claim-submitted":
      return {
        canRequest: false,
        label: "Claim submitted",
        reason:
          "A claim exists and is being processed. Submitting another would duplicate it.",
      };
    case "processing":
      return {
        canRequest: false,
        label: "Refund processing",
        reason: "The refund is already on its way.",
      };
    case "confirmed":
      return {
        canRequest: false,
        label: "Refund confirmed",
        reason: "This refund is complete.",
      };
    case "not-applicable":
      return {
        canRequest: false,
        label: "Not applicable",
        reason: "This contribution is not in a refundable position.",
      };
  }
}
