import type { Contribution } from "@/features/campaigns/types";

/**
 * Backing history filters.
 *
 * A contribution is not one status: a record can be a confirmed contribution
 * whose refund is also available, and a payment can have failed while the escrow
 * leg was never created. So the filter asks "which states does this record carry"
 * and matches if any of them is asked for, rather than collapsing the record into
 * a single label that would have to lie about one of its legs.
 */

export type BackingSort = "newest" | "oldest";

export type BackingStatus =
  | "all"
  | "action-needed"
  | "confirmed"
  | "failed"
  | "pending"
  | "refundable"
  | "refunded";

export const BACKING_SORTS = [
  "newest",
  "oldest",
] as const satisfies readonly BackingSort[];

export const BACKING_STATUSES = [
  "all",
  "action-needed",
  "confirmed",
  "pending",
  "refundable",
  "refunded",
  "failed",
] as const satisfies readonly BackingStatus[];

export const backingStatusLabels: Record<BackingStatus, string> = {
  all: "All contributions",
  "action-needed": "Needs your attention",
  confirmed: "Contribution confirmed",
  failed: "Failed",
  pending: "Still settling",
  refundable: "Refund available",
  refunded: "Refunded",
};

export function isBackingStatus(value: string): value is BackingStatus {
  return (BACKING_STATUSES as readonly string[]).includes(value);
}

export function isBackingSort(value: string): value is BackingSort {
  return (BACKING_SORTS as readonly string[]).includes(value);
}

export type BackingFilters = {
  query: string;
  sort: BackingSort;
  status: BackingStatus;
};

/**
 * Read the history's filters from the query string.
 *
 * Parsed on the server and applied there, so the page a backer shares or reloads
 * shows the same records with or without JavaScript (mirrors the pre-pledges
 * list). An unrecognised value falls back to the unfiltered default rather than
 * throwing or rendering an empty list.
 */
export function parseBackingFilters(
  params: Record<string, string | string[] | undefined>,
): BackingFilters {
  const first = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

  const status = first(params.status);
  const sort = first(params.sort);

  return {
    query: first(params.q).trim().slice(0, 120),
    sort: isBackingSort(sort) ? sort : "newest",
    status: isBackingStatus(status) ? status : "all",
  };
}

/**
 * True when the record is waiting on the backer or on a retry, rather than on
 * the escrow settling by itself.
 */
export function contributionNeedsAction(contribution: Contribution): boolean {
  return (
    contribution.refund.state === "available" ||
    contribution.payment.state === "user-action-required" ||
    contribution.payment.state === "failed" ||
    contribution.contribution.state === "reconciling"
  );
}

/** Every bucket a record belongs to. Empty only for an unrecognised state. */
export function contributionStatuses(
  contribution: Contribution,
): readonly Exclude<BackingStatus, "all">[] {
  const statuses: Exclude<BackingStatus, "all">[] = [];

  if (contributionNeedsAction(contribution)) statuses.push("action-needed");
  if (contribution.contribution.state === "confirmed")
    statuses.push("confirmed");
  if (
    contribution.contribution.state === "pending" ||
    contribution.contribution.state === "reconciling" ||
    contribution.contribution.state === "none" ||
    contribution.payment.state === "processing" ||
    contribution.payment.state === "awaiting-provider"
  ) {
    statuses.push("pending");
  }
  if (
    contribution.contribution.state === "failed" ||
    contribution.payment.state === "failed" ||
    contribution.payment.state === "quote-expired" ||
    contribution.payment.state === "provider-unavailable"
  ) {
    statuses.push("failed");
  }
  if (contribution.refund.state === "available") statuses.push("refundable");
  if (contribution.refund.state === "confirmed") statuses.push("refunded");

  return statuses;
}

function matchesQuery(contribution: Contribution, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return [contribution.campaignTitle, contribution.creator].some((value) =>
    value.toLocaleLowerCase().includes(normalized),
  );
}

export function filterContributions({
  items,
  query,
  sort,
  status,
}: {
  items: readonly Contribution[];
  query: string;
  sort: BackingSort;
  status: BackingStatus;
}): readonly Contribution[] {
  const filtered = items.filter(
    (contribution) =>
      (status === "all" ||
        contributionStatuses(contribution).includes(status)) &&
      matchesQuery(contribution, query),
  );

  return [...filtered].sort((a, b) =>
    sort === "oldest"
      ? a.submittedAt.localeCompare(b.submittedAt)
      : b.submittedAt.localeCompare(a.submittedAt),
  );
}
