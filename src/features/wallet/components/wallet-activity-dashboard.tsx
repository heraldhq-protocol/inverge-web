import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import { ProductSearch } from "@/features/app-shell/components/product-search";
import { WalletActivityList } from "@/features/wallet/components/wallet-activity-list";
import {
  activityCounts,
  filterWalletActivity,
  WALLET_ACTIVITY_FILTERS,
  walletActivityFilterLabels,
  type WalletActivityFilter,
} from "@/features/wallet/lib/activity";
import type { WalletView } from "@/features/wallet/types";

function filterHref(filter: WalletActivityFilter, query: string): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (query.trim()) params.set("q", query.trim());

  const suffix = params.toString();
  return suffix ? `/d/wallet/activity?${suffix}` : "/d/wallet/activity";
}

/**
 * Unified history.
 *
 * Filters are links backed by the URL, so a filtered view is shareable and works
 * before hydration. A contribution and a refund are separate rows because they
 * are separate events, and a failed row stays visible so "no money moved" is
 * something a backer can verify rather than infer.
 */
export function WalletActivityDashboard({
  filter,
  query,
  view,
}: {
  filter: WalletActivityFilter;
  query: string;
  view: WalletView;
}) {
  const counts = activityCounts(view.activity);
  const items = filterWalletActivity({ filter, items: view.activity, query });
  const hasFilters = filter !== "all" || query.trim() !== "";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl">
            Activity
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">
            Contributions and refunds, each with its own settlement state. No
            deposit or withdrawal is fabricated to fill the list.
          </p>
        </div>
        <p className="text-xs text-muted">
          {counts.all === 1 ? "1 record" : `${counts.all} records`}
        </p>
      </div>

      <div className="mt-4 border-t border-border pt-5">
        <ProductSearch
          action="/d/wallet/activity"
          defaultValue={query}
          hiddenFields={
            filter === "all" ? [] : [{ name: "filter", value: filter }]
          }
          label="Search wallet activity"
          placeholder="Search by campaign"
        />
      </div>

      <nav aria-label="Activity filters" className="mt-4 overflow-x-auto">
        <ul className="flex min-w-max items-center gap-2">
          {WALLET_ACTIVITY_FILTERS.map((candidate) => {
            const active = candidate === filter;

            return (
              <li key={candidate}>
                <Link
                  href={filterHref(candidate, query)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    active
                      ? "border-brand/40 bg-brand/10 font-semibold text-brand-strong"
                      : "border-border bg-surface font-medium text-muted hover:border-brand/35 hover:text-ink"
                  }`}
                >
                  {walletActivityFilterLabels[candidate]}
                  <span className="text-[0.6875rem] tabular-nums">
                    {counts[candidate]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-5">
        {items.length > 0 ? (
          <>
            <p className="mb-2 text-xs text-muted" role="status">
              {items.length === 1
                ? "1 record matches"
                : `${items.length} records match`}
              {hasFilters ? " the current filter" : ""}
            </p>
            <div className="rounded-2xl border border-border bg-surface px-4 sm:px-5">
              <WalletActivityList items={items} />
            </div>
          </>
        ) : (
          <StatePanel
            variant="empty"
            eyebrow={hasFilters ? "No matching activity" : "No activity yet"}
            title={
              hasFilters
                ? "Nothing matches those filters"
                : "Your wallet history is empty"
            }
            description={
              hasFilters
                ? "No contribution or refund record matches this filter and search. Clear them to see the whole history."
                : "Contributions you make and refunds returned to you appear here. This preview has no deposits or withdrawals to show."
            }
            action={
              hasFilters ? (
                <Link
                  href="/d/wallet/activity"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Clear filters
                </Link>
              ) : (
                <Link
                  href="/campaigns"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Explore campaigns
                </Link>
              )
            }
          />
        )}
      </div>
    </div>
  );
}
