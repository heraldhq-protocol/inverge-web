"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Cancel01Icon,
  GridViewIcon,
  ListViewIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import { StatePanel } from "@/components/ui/state-panel";
import { Container } from "@/components/ui/container";
import { CampaignCard } from "@/features/campaigns/components/campaign-card";
import {
  activeFilterChips,
  campaignFilterQuery,
  campaignPhaseFilterLabels,
  categoryLabel,
  defaultCampaignFilters,
  filterCampaigns,
} from "@/features/campaigns/lib/filters";
import type {
  Campaign,
  CampaignFilters,
  CampaignPhaseFilter,
  CampaignSort,
} from "@/features/campaigns/types";
import {
  discoveryCategories,
  type DiscoveryCategory,
} from "@/features/home/discovery-categories";

/**
 * Campaign discovery.
 *
 * The filter state is local and mirrored into the query string with `replace`,
 * so results appear as you type while the URL stays shareable and the back
 * button is not filled with every keystroke. Filtering runs through the same
 * pure `filterCampaigns` the server uses, so a shared link and a click produce
 * identical results.
 */

const sortOptions = [
  { value: "ending-soon", label: "Ending soon" },
  { value: "most-funded", label: "Most funded" },
  { value: "newest", label: "Newest" },
  { value: "recently-updated", label: "Recently updated" },
] as const satisfies readonly { value: CampaignSort; label: string }[];

const phaseOptions = (
  Object.keys(campaignPhaseFilterLabels) as CampaignPhaseFilter[]
).map((value) => ({ value, label: campaignPhaseFilterLabels[value] }));

function ViewToggle({
  onChange,
  value,
}: {
  onChange: (view: "grid" | "list") => void;
  value: "grid" | "list";
}) {
  const options = [
    { icon: GridViewIcon, label: "Grid", value: "grid" },
    { icon: ListViewIcon, label: "List", value: "list" },
  ] as const satisfies readonly {
    icon: IconSvgElement;
    label: string;
    value: "grid" | "list";
  }[];

  return (
    <div
      role="group"
      aria-label="Result layout"
      className="flex shrink-0 items-center gap-0.5 rounded-xl border border-border bg-surface p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`grid size-10 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "bg-brand/12 text-brand-strong"
                : "text-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            <HugeiconsIcon
              icon={option.icon}
              size={17}
              strokeWidth={1.9}
              aria-hidden="true"
            />
            <span className="sr-only">{option.label} layout</span>
          </button>
        );
      })}
    </div>
  );
}

function CategoryFilter({
  counts,
  onChange,
  value,
}: {
  counts: Readonly<Record<string, number>>;
  onChange: (category: CampaignFilters["category"]) => void;
  value: CampaignFilters["category"];
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const options: readonly { count: number; label: string; value: string }[] = [
    { count: total, label: "All", value: "all" },
    ...discoveryCategories.map((category) => ({
      count: counts[category.value] ?? 0,
      label: category.label,
      value: category.value,
    })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(option.value as CampaignFilters["category"])
            }
            aria-pressed={active}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "border-brand/40 bg-brand/10 font-semibold text-brand-strong"
                : "border-border bg-surface font-medium text-ink hover:border-brand/35 hover:bg-canvas"
            }`}
          >
            {option.label}
            <span
              className={`text-xs tabular-nums ${active ? "text-brand-strong" : "text-muted"}`}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function CampaignDiscovery({
  candidates,
  categoryCounts,
  initialFilters,
  nowIso,
  totalPublic,
}: {
  candidates: readonly Campaign[];
  categoryCounts: Readonly<Record<string, number>>;
  initialFilters: CampaignFilters;
  nowIso: string;
  totalPublic: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<CampaignFilters>(initialFilters);

  const serialised = campaignFilterQuery(filters);

  useEffect(() => {
    if (searchParams.toString() === serialised) return;

    startTransition(() => {
      router.replace(serialised ? `${pathname}?${serialised}` : pathname, {
        scroll: false,
      });
    });
  }, [pathname, router, searchParams, serialised]);

  const results = useMemo(
    () => filterCampaigns(candidates, filters),
    [candidates, filters],
  );

  const chips = activeFilterChips(filters);
  const hasFilters = chips.length > 0;

  function update(patch: Partial<CampaignFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  return (
    <div
      id="campaigns"
      className={`scroll-mt-24 transition-opacity ${isPending ? "opacity-70" : ""}`}
      aria-busy={isPending}
    >
      <Container>
        <div className="border-b border-border pb-6 pt-9 sm:pt-11">
          <h2 className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl">
            Explore campaigns
          </h2>
          <p className="mt-1 text-sm text-muted">
            {totalPublic === 1
              ? "1 campaign is open to discovery."
              : `${totalPublic} campaigns are open to discovery.`}
          </p>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="campaign-search" className="sr-only">
                Search campaigns
              </label>
              <HugeiconsIcon
                icon={Search01Icon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                id="campaign-search"
                type="search"
                value={filters.query}
                onChange={(event) => update({ query: event.target.value })}
                placeholder="Search campaigns, creators, or places"
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1 sm:w-48">
                <label htmlFor="campaign-phase" className="sr-only">
                  Filter by status
                </label>
                <Select
                  id="campaign-phase"
                  aria-label="Filter by status"
                  value={filters.phase}
                  options={phaseOptions}
                  onValueChange={(value) =>
                    update({ phase: value as CampaignPhaseFilter })
                  }
                />
              </div>
              <div className="min-w-0 flex-1 sm:w-52">
                <label htmlFor="campaign-sort" className="sr-only">
                  Sort campaigns
                </label>
                <Select
                  id="campaign-sort"
                  aria-label="Sort campaigns"
                  value={filters.sort}
                  options={sortOptions}
                  onValueChange={(value) =>
                    update({ sort: value as CampaignSort })
                  }
                />
              </div>
              <ViewToggle
                value={filters.view}
                onChange={(view) => update({ view })}
              />
            </div>
          </div>

          <div className="mt-4">
            <CategoryFilter
              counts={categoryCounts}
              value={filters.category}
              onChange={(category) => update({ category })}
            />
          </div>

          {hasFilters ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted">
                Filtered by
              </span>
              {chips.map((chip) => (
                <Pill key={chip.key} tone="neutral">
                  {chip.key === "category"
                    ? categoryLabel(chip.label as DiscoveryCategory)
                    : chip.label}
                </Pill>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFilters({ ...defaultCampaignFilters, view: filters.view })
                }
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={13}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Clear filters
              </button>
            </div>
          ) : null}
        </div>

        {results.length > 0 ? (
          <div className="py-7 sm:py-9">
            <p className="mb-4 text-sm text-muted" role="status">
              {results.length === 1
                ? "1 campaign matches"
                : `${results.length} campaigns match`}
            </p>
            <div
              className={
                filters.view === "grid"
                  ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {results.map((campaign, index) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  nowIso={nowIso}
                  view={filters.view}
                  priority={index === 0}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 sm:py-10">
            <StatePanel
              variant="empty"
              eyebrow="No matching campaigns"
              title="Try a different filter"
              description="No campaign matches the current search, category, and status. Clear the filters to see every campaign that is open to discovery."
              action={
                <button
                  type="button"
                  onClick={() => setFilters(defaultCampaignFilters)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Clear filters
                </button>
              }
            />
          </div>
        )}
      </Container>
    </div>
  );
}
