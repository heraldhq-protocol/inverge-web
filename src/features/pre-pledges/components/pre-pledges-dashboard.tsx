import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";

import { MetricStrip } from "@/components/ui/metric-strip";
import { StatePanel } from "@/components/ui/state-panel";
import { ProductSearch } from "@/features/app-shell/components/product-search";
import { formatNaira, sumNairaAmounts } from "@/features/home/lib/format-money";
import { PrePledgeFilters } from "@/features/pre-pledges/components/pre-pledge-filters";
import { PrePledgeSection } from "@/features/pre-pledges/components/pre-pledge-section";
import { filterAndSortPrePledges } from "@/features/pre-pledges/lib/filter-pre-pledges";
import type {
  PrePledgesData,
  PrePledgeSort,
  PrePledgeStatusFilter,
} from "@/features/pre-pledges/types";

export function PrePledgesDashboard({
  data,
  query = "",
  sort = "most-recent",
  status = "all",
}: {
  data: PrePledgesData;
  query?: string;
  sort?: PrePledgeSort;
  status?: PrePledgeStatusFilter;
}) {
  const allItems = [...data.active, ...data.past];
  const visibleItems = filterAndSortPrePledges({
    items: allItems,
    query,
    sort,
    status,
  });
  const visibleActive = visibleItems.filter((item) => item.stage === "active");
  const visiblePast = visibleItems.filter((item) => item.stage === "past");
  const totalIntent = sumNairaAmounts(data.active.map((item) => item.intent));
  const nearValidationCount = data.active.filter(
    (item) => item.status === "near-validation",
  ).length;
  const searchFields = [
    ...(status === "all" ? [] : [{ name: "status", value: status }]),
    ...(sort === "most-recent" ? [] : [{ name: "sort", value: sort }]),
  ];

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
      <ProductSearch
        action="/pre-pledges"
        defaultValue={query}
        hiddenFields={searchFields}
      />

      <header className="mt-8 border-b border-border pb-7 sm:mt-10 sm:pb-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
                Pre-pledges
              </p>
              <span
                className="text-xs text-muted"
                title="Pre-pledge figures are sample data"
              >
                Sample data
              </span>
            </div>
            <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
              Your pre-pledges
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-muted sm:text-base">
              Track what you may back if these ideas become campaigns. No money
              has moved.
            </p>
          </div>
          <Link
            href="/ideas"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Explore ideas
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <MetricStrip
          className="mt-7 max-w-2xl"
          items={[
            { value: formatNaira(totalIntent), label: "Total intent" },
            { value: data.active.length, label: "Active ideas" },
            { value: nearValidationCount, label: "Near validation" },
          ]}
        />

        <aside className="mt-7 rounded-2xl border border-brand/15 bg-brand/[0.035] p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-strong">
              <Info className="size-4.5" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-ink">No payment yet</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted sm:ml-10 sm:mt-0">
            Pre-pledges record what you may contribute later. You won&apos;t be
            charged unless you choose to back a campaign after it launches.
          </p>
        </aside>
      </header>

      <div className="py-7 sm:py-8">
        <PrePledgeFilters sort={sort} status={status} />
      </div>

      {visibleItems.length > 0 ? (
        <div className="space-y-8 pb-3 sm:space-y-10">
          {visibleActive.length > 0 ? (
            <PrePledgeSection
              stage="active"
              title="Active pre-pledges"
              items={visibleActive}
            />
          ) : null}
          {visiblePast.length > 0 ? (
            <PrePledgeSection
              stage="past"
              title="Past pre-pledges"
              description="Ideas you previously supported that are no longer actively validating."
              items={visiblePast}
            />
          ) : null}
        </div>
      ) : (
        <StatePanel
          variant="empty"
          eyebrow="No matching pre-pledges"
          title="Try another filter"
          description="Clear the current search and status filters to see all of your pre-pledge activity."
          action={
            <Link
              href="/pre-pledges"
              scroll={false}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Clear filters
            </Link>
          }
        />
      )}
    </div>
  );
}
