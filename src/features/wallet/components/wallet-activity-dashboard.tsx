import { HugeiconsIcon } from "@hugeicons/react";
import { ReceiptTextIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
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

function ResultCount({
  count,
  hasFilters,
}: {
  count: number;
  hasFilters: boolean;
}) {
  return (
    <p className="text-xs text-muted" role="status">
      {count === 1 ? "1 record matches" : `${count} records match`}
      {hasFilters ? " the current filter" : ""}
    </p>
  );
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
  const preview = view.dataSource === "preview";

  return (
    <section
      aria-labelledby="wallet-activity-title"
      className="rounded-2xl border border-border bg-surface"
    >
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="wallet-activity-title"
                className="text-base font-semibold text-ink"
              >
                Activity history
              </h2>
              {preview ? (
                <Pill tone="neutral" size="xs">
                  Example data
                </Pill>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              {counts.all === 1 ? "1 record" : `${counts.all} records`}
            </p>
          </div>
        </div>

        {preview ? (
          <p className="mt-1 text-xs leading-5 text-muted">
            Sample records until live wallet activity is connected.
          </p>
        ) : null}

        <div className="mt-3">
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

        <nav
          aria-label="Activity filters"
          className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex min-w-max items-center gap-2">
            {WALLET_ACTIVITY_FILTERS.map((candidate) => {
              const active = candidate === filter;

              return (
                <li key={candidate}>
                  <Link
                    href={filterHref(candidate, query)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
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
      </div>

      {items.length > 0 ? (
        <div className="px-3 py-1 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3">
            <ResultCount count={items.length} hasFilters={hasFilters} />
            {hasFilters ? (
              <Link
                href="/d/wallet/activity"
                className="inline-flex min-h-8 items-center text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
          <WalletActivityList items={items} />
        </div>
      ) : (
        <div className="px-5 py-10 text-center sm:py-12">
          <span
            aria-hidden="true"
            className="mx-auto grid size-11 place-items-center rounded-full bg-brand/10 text-brand-strong"
          >
            <HugeiconsIcon icon={ReceiptTextIcon} size={20} strokeWidth={1.8} />
          </span>
          <h2 className="mt-3 text-base font-semibold text-ink">
            {hasFilters ? "Nothing matches those filters" : "No activity yet"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
            {hasFilters
              ? "No contribution or refund record matches this filter and search. Clear them to see the whole history."
              : "Contributions you make and refunds returned to you will appear here."}
          </p>
          <Link
            href={hasFilters ? "/d/wallet/activity" : "/campaigns"}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {hasFilters ? "Clear filters" : "Explore campaigns"}
          </Link>
        </div>
      )}
    </section>
  );
}
