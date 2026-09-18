"use client";

import {
  ArrowRight,
  LayoutGrid,
  MonitorSmartphone,
  Palette,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sprout,
  Sun,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { StatePanel } from "@/components/ui/state-panel";
import {
  discoveryCategories,
  isDiscoveryCategory,
  type DiscoveryCategory,
} from "@/features/home/discovery-categories";
import { IdeaDiscoveryCard } from "@/features/ideas/components/idea-discovery-card";
import { filterAndSortIdeas } from "@/features/ideas/lib/filter-ideas";
import type {
  IdeaRegion,
  IdeasDiscoveryData,
  IdeaSort,
  IdeaValidationStage,
} from "@/features/ideas/types";

const categoryIcons = {
  all: LayoutGrid,
  technology: MonitorSmartphone,
  agriculture: Sprout,
  "clean-energy": Sun,
  creative: Palette,
  community: Users,
  "food-retail": ShoppingBag,
} as const;

const regionOptions = [
  { value: "all", label: "All regions" },
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "senegal", label: "Senegal" },
] as const satisfies readonly SelectOption[];

const stageOptions = [
  { value: "all", label: "All validation stages" },
  { value: "near", label: "Near validation" },
  { value: "growing", label: "Growing support" },
  { value: "early", label: "Early signal" },
] as const satisfies readonly SelectOption[];

const sortOptions = [
  { value: "most-validated", label: "Most validated" },
  { value: "most-supported", label: "Most supported" },
  { value: "newest", label: "Newest" },
] as const satisfies readonly SelectOption[];

const PAGE_SIZE = 6;

type CategoryFilter = "all" | DiscoveryCategory;
type RegionFilter = "all" | IdeaRegion;
type StageFilter = "all" | IdeaValidationStage;

function categoryFromValue(value: string): CategoryFilter {
  return isDiscoveryCategory(value) ? value : "all";
}

function regionFromValue(value: string): RegionFilter {
  return regionOptions.some((option) => option.value === value)
    ? (value as RegionFilter)
    : "all";
}

function stageFromValue(value: string): StageFilter {
  return stageOptions.some((option) => option.value === value)
    ? (value as StageFilter)
    : "all";
}

function sortFromValue(value: string): IdeaSort {
  return sortOptions.some((option) => option.value === value)
    ? (value as IdeaSort)
    : "most-validated";
}

export function IdeasDashboard({
  data,
  viewer = "authenticated",
}: {
  data: IdeasDiscoveryData;
  viewer?: "authenticated" | "visitor";
}) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [sort, setSort] = useState<IdeaSort>("most-validated");
  const [stage, setStage] = useState<StageFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filters = useMemo(
    () => ({ category, query, region, sort, stage }),
    [category, query, region, sort, stage],
  );
  const featuredIdeas = useMemo(
    () => filterAndSortIdeas(data.featured, filters),
    [data.featured, filters],
  );
  const allIdeas = useMemo(
    () => filterAndSortIdeas(data.ideas, filters),
    [data.ideas, filters],
  );
  const visibleIdeas = allIdeas.slice(0, visibleCount);
  const resultCount = featuredIdeas.length + allIdeas.length;
  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    region !== "all" ||
    stage !== "all";

  function resetVisibleCount() {
    setVisibleCount(PAGE_SIZE);
  }

  function clearFilters() {
    setCategory("all");
    setQuery("");
    setRegion("all");
    setSort("most-validated");
    setStage("all");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 xl:px-10">
      <header className="border-b border-border pb-6 sm:pb-8">
        <div className="grid items-end gap-6 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(32rem,1.3fr)]">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
                Discover ideas
              </p>
              <span
                className="text-xs text-muted"
                title="Idea catalogue figures are sample data"
              >
                Sample data
              </span>
            </div>
            <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
              Find something worth believing in.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Explore early-stage ideas gathering real support, feedback, and
              pre-pledge intent before fundraising begins.
            </p>
          </div>

          <div role="search" className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value.slice(0, 120));
                resetVisibleCount();
              }}
              aria-label="Search ideas"
              className="min-h-14 pl-12 pr-12"
              placeholder="Search ideas, problems, creators, or places"
              type="search"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  resetVisibleCount();
                }}
                aria-label="Clear idea search"
                className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
              >
                <X className="size-4.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-7">
          <p id="idea-category-label" className="sr-only">
            Filter by category
          </p>
          <div
            role="group"
            aria-labelledby="idea-category-label"
            className="-mx-4 flex snap-x gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
          >
            {[
              { value: "all" as const, label: "All" },
              ...discoveryCategories,
            ].map((item) => {
              const Icon = categoryIcons[item.value];
              const isSelected = category === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setCategory(categoryFromValue(item.value));
                    resetVisibleCount();
                  }}
                  className={`flex min-h-14 shrink-0 snap-start items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-12 ${
                    isSelected
                      ? "border-brand/20 bg-brand/8 text-brand-strong"
                      : "border-transparent text-muted hover:border-border hover:bg-surface hover:text-ink"
                  }`}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <section
        aria-label="Idea filters"
        className="border-b border-border py-5"
      >
        <div className="grid grid-cols-2 gap-3 lg:hidden">
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="mobile-idea-filters"
            onClick={() => setFiltersOpen((isOpen) => !isOpen)}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              filtersOpen || region !== "all" || stage !== "all"
                ? "border-brand/25 bg-brand/8 text-brand-strong"
                : "border-border bg-surface text-ink"
            }`}
          >
            <SlidersHorizontal className="size-4.5" aria-hidden="true" />
            Filters
          </button>
          <Select
            aria-label="Sort ideas"
            options={sortOptions}
            value={sort}
            onValueChange={(value) => {
              setSort(sortFromValue(value));
              resetVisibleCount();
            }}
          />
        </div>

        <div
          id="mobile-idea-filters"
          className={`${filtersOpen ? "mt-4 grid" : "hidden"} grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:hidden`}
        >
          <div>
            <label
              id="mobile-region-label"
              className="mb-1.5 block text-xs font-semibold text-ink"
            >
              Region
            </label>
            <Select
              aria-labelledby="mobile-region-label"
              options={regionOptions}
              value={region}
              onValueChange={(value) => {
                setRegion(regionFromValue(value));
                resetVisibleCount();
              }}
            />
          </div>
          <div>
            <label
              id="mobile-stage-label"
              className="mb-1.5 block text-xs font-semibold text-ink"
            >
              Validation stage
            </label>
            <Select
              aria-labelledby="mobile-stage-label"
              options={stageOptions}
              value={stage}
              onValueChange={(value) => {
                setStage(stageFromValue(value));
                resetVisibleCount();
              }}
            />
          </div>
        </div>

        <div className="hidden grid-cols-[repeat(3,minmax(0,15rem))_minmax(8rem,1fr)] items-end gap-4 lg:grid">
          <div>
            <label
              id="desktop-region-label"
              className="mb-1.5 block text-xs font-semibold text-ink"
            >
              Region
            </label>
            <Select
              aria-labelledby="desktop-region-label"
              options={regionOptions}
              value={region}
              onValueChange={(value) => {
                setRegion(regionFromValue(value));
                resetVisibleCount();
              }}
            />
          </div>
          <div>
            <label
              id="desktop-stage-label"
              className="mb-1.5 block text-xs font-semibold text-ink"
            >
              Validation stage
            </label>
            <Select
              aria-labelledby="desktop-stage-label"
              options={stageOptions}
              value={stage}
              onValueChange={(value) => {
                setStage(stageFromValue(value));
                resetVisibleCount();
              }}
            />
          </div>
          <div>
            <label
              id="desktop-sort-label"
              className="mb-1.5 block text-xs font-semibold text-ink"
            >
              Sort
            </label>
            <Select
              aria-labelledby="desktop-sort-label"
              options={sortOptions}
              value={sort}
              onValueChange={(value) => {
                setSort(sortFromValue(value));
                resetVisibleCount();
              }}
            />
          </div>
          <div className="flex min-h-12 items-center justify-end gap-4">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 rounded-lg px-2 text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Clear filters
              </button>
            ) : null}
            <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">
              {resultCount} {resultCount === 1 ? "idea" : "ideas"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 lg:hidden">
          <p
            className="text-sm font-semibold tabular-nums text-ink"
            aria-live="polite"
          >
            {resultCount} {resultCount === 1 ? "idea" : "ideas"}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-11 rounded-lg px-1 text-sm font-semibold text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {resultCount > 0 ? (
        <>
          {featuredIdeas.length > 0 ? (
            <section className="py-7 sm:py-9" aria-labelledby="featured-ideas">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    Curated discovery
                  </p>
                  <h2
                    id="featured-ideas"
                    className="mt-1 text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
                  >
                    Featured this week
                  </h2>
                </div>
                <p className="hidden max-w-sm text-right text-xs leading-5 text-muted sm:block">
                  Paid placement is labelled and never changes validation
                  metrics.
                </p>
              </div>

              <div className="-mx-4 flex snap-x items-start gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 xl:mx-0 xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)_minmax(15rem,1fr)] xl:items-start xl:overflow-visible xl:px-0 xl:pb-0">
                {featuredIdeas.map((idea, index) => (
                  <div
                    key={idea.id}
                    className={`shrink-0 snap-start ${
                      index === 0
                        ? "w-[88vw] max-w-[46rem] xl:w-auto xl:max-w-none"
                        : "w-[78vw] max-w-sm xl:w-auto xl:max-w-none"
                    }`}
                  >
                    <IdeaDiscoveryCard
                      idea={idea}
                      variant={index === 0 ? "lead" : "featured"}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {allIdeas.length > 0 ? (
            <section
              className={`${featuredIdeas.length > 0 ? "border-t" : ""} border-border py-7 sm:py-9`}
              aria-labelledby="all-ideas"
            >
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    Keep exploring
                  </p>
                  <h2
                    id="all-ideas"
                    className="mt-1 text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
                  >
                    All ideas
                  </h2>
                </div>
                <p className="text-xs tabular-nums text-muted sm:text-sm">
                  Showing {visibleIdeas.length} of {allIdeas.length}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {visibleIdeas.map((idea) => (
                  <IdeaDiscoveryCard key={idea.id} idea={idea} />
                ))}
              </div>

              {visibleIdeas.length < allIdeas.length ? (
                <div className="mt-7 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) => count + PAGE_SIZE)
                    }
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Show more ideas
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      ) : (
        <div className="py-8 sm:py-10">
          <StatePanel
            variant="empty"
            eyebrow="No matching ideas"
            title="Try a broader search"
            description="Change the category, region, or validation stage to discover more ideas."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Clear all filters
              </button>
            }
          />
        </div>
      )}

      {viewer === "visitor" ? (
        <aside className="mb-3 mt-2 flex flex-col gap-5 rounded-3xl bg-contrast px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Help shape what gets built
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] sm:text-2xl">
              Support, give feedback, or record a pre-pledge.
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/65">
              Create an account to take part. A pre-pledge records intent only;
              no money moves at this stage.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-contrast focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            Create account
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      ) : null}
    </div>
  );
}
