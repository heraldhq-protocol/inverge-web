import type { PillTone } from "@/components/ui/pill";
import type { Contribution } from "@/features/campaigns/types";
import { usdCentsToTokenAmount } from "@/features/wallet/lib/token-amount";
import type {
  WalletActivityDirection,
  WalletActivityItem,
  WalletActivityStatus,
} from "@/features/wallet/types";

/**
 * A unified wallet history derived from the contribution records the product
 * already has.
 *
 * It does not fabricate deposits, withdrawals, or signatures. Every item points
 * back to a real preview contribution, and an item only claims money moved when
 * its payment/contribution/refund leg says so. Failed attempts stay visible so a
 * backer can see what did not happen, marked as moving nothing.
 */

export type WalletActivityFilter =
  "all" | "attention" | "contributions" | "pending" | "refunds";

export const WALLET_ACTIVITY_FILTERS = [
  "all",
  "contributions",
  "refunds",
  "pending",
  "attention",
] as const satisfies readonly WalletActivityFilter[];

export const walletActivityFilterLabels: Record<WalletActivityFilter, string> =
  {
    all: "All activity",
    attention: "Needs attention",
    contributions: "Contributions",
    pending: "Still settling",
    refunds: "Refunds",
  };

export const walletActivityStatusLabels: Record<WalletActivityStatus, string> =
  {
    available: "Refund available",
    confirmed: "Confirmed",
    failed: "Failed",
    pending: "Pending",
    reconciling: "Reconciling",
  };

export const walletActivityStatusTones: Record<WalletActivityStatus, PillTone> =
  {
    available: "warning",
    confirmed: "accent",
    failed: "danger",
    pending: "warning",
    reconciling: "warning",
  };

export const walletDirectionLabels: Record<WalletActivityDirection, string> = {
  in: "In",
  none: "No transfer",
  out: "Out",
};

export function isWalletActivityFilter(
  value: string,
): value is WalletActivityFilter {
  return (WALLET_ACTIVITY_FILTERS as readonly string[]).includes(value);
}

function contributionStatus(contribution: Contribution): WalletActivityStatus {
  if (
    contribution.payment.state === "failed" ||
    contribution.payment.state === "quote-expired" ||
    contribution.payment.state === "provider-unavailable"
  ) {
    return "failed";
  }

  if (contribution.contribution.state === "confirmed") return "confirmed";
  if (contribution.contribution.state === "reconciling") return "reconciling";
  return "pending";
}

function contributionDirection(
  contribution: Contribution,
): WalletActivityDirection {
  if (contribution.payment.state === "succeeded") return "out";
  if (contribution.payment.state === "processing") return "out";

  return "none";
}

function contributionDescription(contribution: Contribution): string {
  switch (contribution.contribution.state) {
    case "confirmed":
      return "The payment succeeded and the contribution is recorded against the campaign's escrow.";
    case "reconciling":
      return "The payment succeeded. Inverge is still reconciling this contribution against the escrow record.";
    case "pending":
      return "The payment leg is in progress and the contribution is not yet recorded against escrow.";
    case "failed":
      return "No money moved: the contribution was not recorded against escrow.";
    case "none":
      return contribution.payment.state === "failed"
        ? "No money moved: the payment did not complete."
        : "The payment has not completed, so no contribution exists yet.";
  }
}

function contributionItem(contribution: Contribution): WalletActivityItem {
  const status = contributionStatus(contribution);
  const direction =
    status === "failed" ? "none" : contributionDirection(contribution);
  const confirmedAt = contribution.contribution.confirmedAt;

  return {
    amount:
      status === "failed"
        ? null
        : {
            ...usdCentsToTokenAmount(contribution.amount.atomic),
          },
    demo: true,
    description: contributionDescription(contribution),
    direction,
    id: `activity-${contribution.id}`,
    kind: "contribution",
    occurredAt: confirmedAt ?? contribution.submittedAt,
    reference: {
      href: `/d/backing/${contribution.id}`,
      id: contribution.id,
      kind: "contribution",
    },
    status,
    title: `Contribution to ${contribution.campaignTitle}`,
    transaction: contribution.contribution.transaction
      ? {
          network: contribution.contribution.transaction.network,
          signature: contribution.contribution.transaction.signature,
        }
      : null,
  };
}

function refundItem(contribution: Contribution): WalletActivityItem | null {
  const refund = contribution.refund;

  switch (refund.state) {
    case "not-applicable":
      return null;
    case "available":
      return {
        amount: usdCentsToTokenAmount(
          (refund.eligibleAmount ?? contribution.amount).atomic,
        ),
        demo: true,
        description:
          "Eligible to claim because the campaign missed its target. Claiming is not connected in this build.",
        direction: "none",
        id: `activity-refund-${contribution.id}`,
        kind: "refund",
        occurredAt: contribution.submittedAt,
        reference: {
          href: `/d/backing/${contribution.id}`,
          id: contribution.id,
          kind: "refund",
        },
        status: "available",
        title: `Refund available from ${contribution.campaignTitle}`,
        transaction: refund.transaction
          ? {
              network: refund.transaction.network,
              signature: refund.transaction.signature,
            }
          : null,
      };
    case "claim-submitted":
    case "processing":
      return {
        amount: usdCentsToTokenAmount(
          (refund.eligibleAmount ?? contribution.amount).atomic,
        ),
        demo: true,
        description:
          "A refund claim exists and is being processed. It is not confirmed until the refund leg says so.",
        direction: "none",
        id: `activity-refund-${contribution.id}`,
        kind: "refund",
        occurredAt:
          refund.claimSubmittedAt ??
          refund.confirmedAt ??
          contribution.submittedAt,
        reference: {
          href: `/d/backing/${contribution.id}`,
          id: contribution.id,
          kind: "refund",
        },
        status: "pending",
        title: `Refund from ${contribution.campaignTitle}`,
        transaction: refund.transaction
          ? {
              network: refund.transaction.network,
              signature: refund.transaction.signature,
            }
          : null,
      };
    case "confirmed":
      return {
        amount: usdCentsToTokenAmount(
          (refund.eligibleAmount ?? contribution.amount).atomic,
        ),
        demo: true,
        description:
          "The refund is confirmed and was returned to the source of the contribution.",
        direction: "in",
        id: `activity-refund-${contribution.id}`,
        kind: "refund",
        occurredAt: refund.confirmedAt ?? contribution.submittedAt,
        reference: {
          href: `/d/backing/${contribution.id}`,
          id: contribution.id,
          kind: "refund",
        },
        status: "confirmed",
        title: `Refund from ${contribution.campaignTitle}`,
        transaction: refund.transaction
          ? {
              network: refund.transaction.network,
              signature: refund.transaction.signature,
            }
          : null,
      };
    case "failed":
      return {
        amount: null,
        demo: true,
        description:
          "The refund attempt did not succeed, so no money moved. Retrying is not connected in this build.",
        direction: "none",
        id: `activity-refund-${contribution.id}`,
        kind: "refund",
        occurredAt:
          refund.claimSubmittedAt ??
          refund.confirmedAt ??
          contribution.submittedAt,
        reference: {
          href: `/d/backing/${contribution.id}`,
          id: contribution.id,
          kind: "refund",
        },
        status: "failed",
        title: `Refund attempt for ${contribution.campaignTitle}`,
        transaction: refund.transaction
          ? {
              network: refund.transaction.network,
              signature: refund.transaction.signature,
            }
          : null,
      };
  }
}

export function walletActivityFromContributions(
  contributions: readonly Contribution[],
): readonly WalletActivityItem[] {
  const items: WalletActivityItem[] = [];

  for (const contribution of contributions) {
    items.push(contributionItem(contribution));

    const refund = refundItem(contribution);
    if (refund) items.push(refund);
  }

  return sortWalletActivity(items);
}

export function sortWalletActivity(
  items: readonly WalletActivityItem[],
): readonly WalletActivityItem[] {
  return [...items].sort((a, b) => {
    const byDate = b.occurredAt.localeCompare(a.occurredAt);
    return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
  });
}

export function isPendingActivity(item: WalletActivityItem): boolean {
  return item.status === "pending" || item.status === "reconciling";
}

export function needsAttention(item: WalletActivityItem): boolean {
  return item.status === "available" || item.status === "failed";
}

export function activityCounts(
  items: readonly WalletActivityItem[],
): Record<WalletActivityFilter, number> {
  return {
    all: items.length,
    attention: items.filter(needsAttention).length,
    contributions: items.filter((item) => item.kind === "contribution").length,
    pending: items.filter(isPendingActivity).length,
    refunds: items.filter((item) => item.kind === "refund").length,
  };
}

function matchesFilter(
  item: WalletActivityItem,
  filter: WalletActivityFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "contributions":
      return item.kind === "contribution";
    case "refunds":
      return item.kind === "refund";
    case "pending":
      return isPendingActivity(item);
    case "attention":
      return needsAttention(item);
  }
}

export function filterWalletActivity({
  filter,
  items,
  query,
}: {
  filter: WalletActivityFilter;
  items: readonly WalletActivityItem[];
  query: string;
}): readonly WalletActivityItem[] {
  const normalized = query.trim().toLocaleLowerCase();

  return items.filter((item) => {
    if (!matchesFilter(item, filter)) return false;
    if (!normalized) return true;

    return [item.title, item.description].some((value) =>
      value.toLocaleLowerCase().includes(normalized),
    );
  });
}
