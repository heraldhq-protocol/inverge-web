import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Coins01Icon,
  Undo03Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { MetricCard } from "@/components/ui/metric-card";
import { StatePanel } from "@/components/ui/state-panel";
import { ProductSearch } from "@/features/app-shell/components/product-search";
import { BackingFilters } from "@/features/campaigns/components/backing-filters";
import { ContributionCard } from "@/features/campaigns/components/contribution-card";
import {
  filterContributions,
  type BackingSort,
  type BackingStatus,
} from "@/features/campaigns/lib/backing";
import type { BackingView } from "@/features/campaigns/server/backing";

export function BackingDashboard({
  view,
  query,
  sort,
  status,
}: {
  view: BackingView;
  query: string;
  sort: BackingSort;
  status: BackingStatus;
}) {
  const contributions = filterContributions({
    items: view.contributions,
    query,
    sort,
    status,
  });

  const hasFilters = query !== "" || status !== "all";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Your space
          </p>
        </div>
        <h1 className="mt-2 text-balance text-[1.75rem] font-bold leading-tight tracking-[-0.045em] text-ink sm:text-4xl">
          Campaigns you back
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted sm:text-[0.9375rem]">
          Every contribution and each leg of its lifecycle: what the payment
          provider did, what the escrow recorded, and what can be refunded.
          These are separate questions, and this page keeps them apart.
        </p>
      </header>

      {view.needsAttention > 0 ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={18}
            strokeWidth={1.9}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-warning-strong"
          />
          <p className="text-sm leading-6 text-ink">
            {view.needsAttention === 1
              ? "1 contribution needs your attention."
              : `${view.needsAttention} contributions need your attention.`}{" "}
            <Link
              href="/d/backing?status=action-needed"
              className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Show only those
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Contributed"
          icon={Coins01Icon}
          value={<Amount value={view.totals.contributed} />}
          hint="Payments the provider actually took."
        />
        <MetricCard
          label="Refundable"
          icon={Undo03Icon}
          value={<Amount value={view.totals.refundable} />}
          hint="Claimable because a campaign missed its target."
        />
        <MetricCard
          label="Refunded"
          icon={Wallet01Icon}
          value={<Amount value={view.totals.refunded} />}
          hint="Already returned to you."
        />
      </div>

      <div className="mt-7 border-t border-border pt-6">
        <ProductSearch
          action="/d/backing"
          defaultValue={query}
          hiddenFields={[
            ...(status === "all" ? [] : [{ name: "status", value: status }]),
            ...(sort === "newest" ? [] : [{ name: "sort", value: sort }]),
          ]}
          label="Search campaigns you back"
          placeholder="Search campaigns or creators"
        />

        <div className="mt-3">
          <BackingFilters sort={sort} status={status} />
        </div>
      </div>

      <div className="mt-6">
        {contributions.length > 0 ? (
          <>
            <p className="mb-3 text-sm text-muted" role="status">
              {contributions.length === 1
                ? "1 contribution"
                : `${contributions.length} contributions`}
              {hasFilters ? " match the current filters" : ""}
            </p>
            <ul className="grid gap-4 xl:grid-cols-2">
              {contributions.map((contribution) => (
                <li key={contribution.id}>
                  <ContributionCard contribution={contribution} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <StatePanel
            variant="empty"
            eyebrow={
              hasFilters ? "No matching contributions" : "No contributions yet"
            }
            title={
              hasFilters
                ? "Try a different filter"
                : "You haven't backed a campaign yet"
            }
            description={
              hasFilters
                ? "No contribution matches the current search and status. Clear the filters to see your whole history."
                : "When you contribute to a campaign, its record appears here with the payment, escrow, and refund states kept apart."
            }
            action={
              hasFilters ? (
                <Link
                  href="/d/backing"
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
