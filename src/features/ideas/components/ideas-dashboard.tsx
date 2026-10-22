"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Cancel01Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Compass01Icon,
  GridViewIcon,
  HeartHandshakeIcon,
  ListViewIcon,
  Search01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { StatePanel } from "@/components/ui/state-panel";
import {
  DiscoveryHeroFeatured,
  type HeroFeaturedIdea,
} from "@/features/ideas/components/discovery-hero";
import { FeaturedCarousel } from "@/features/ideas/components/featured-carousel";
import { FilterSidebar } from "@/features/ideas/components/filter-sidebar";
import { IdeaDiscoveryCard } from "@/features/ideas/components/idea-discovery-card";
import { TopicDirectory } from "@/features/ideas/components/topic-directory";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { filterAndSortIdeas } from "@/features/ideas/lib/filter-ideas";
import {
  IDEA_PAGE_SIZE,
  activeFilterChips,
  activeSortTab,
  countIdeasByCategory,
  defaultIdeaFilters,
  filtersForSortTab,
  ideaFiltersFromSearch,
  ideaFiltersToQuery,
  ideaSubcategoryCountsByCategory,
  sortTabs,
  type ActiveFilterChip,
  type IdeaFilterState,
  type IdeaResultView,
} from "@/features/ideas/lib/filters";
import type { IdeasDiscoveryData, Topic } from "@/features/ideas/types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=1000&fit=crop&q=80";

const benefits = [
  {
    icon: HeartHandshakeIcon,
    text: "Support ideas you love",
  },
  {
    icon: Compass01Icon,
    text: "Get early access to new projects",
  },
  {
    icon: UserGroupIcon,
    text: "Be part of a growing creative community",
  },
] as const satisfies readonly { icon: IconSvgElement; text: string }[];

function DiscoveryHero({ idea }: { idea: HeroFeaturedIdea | undefined }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/80 bg-canvas">
      <div
        aria-hidden="true"
        className="absolute -right-24 top-0 -z-10 size-[28rem] rounded-full bg-brand/[0.055] blur-3xl"
      />
      <Container className="grid items-center gap-7 py-8 sm:py-10 lg:grid-cols-[1.02fr_1.08fr] lg:gap-10 lg:py-11">
        <div className="max-w-xl">
          <Eyebrow>Discover ideas</Eyebrow>
          <h1 className="mt-3 text-balance text-[2.1rem] font-bold leading-[1.06] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.25rem]">
            Real ideas. Real people.{" "}
            <span className="block text-brand">A bigger tomorrow.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base sm:leading-7">
            Explore innovative ideas, support creators, and help turn great
            ideas into real-world impact.
          </p>

          <ul className="mt-5 grid gap-2.5 sm:grid-cols-3 sm:gap-4">
            {benefits.map(({ icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 text-xs leading-5 text-ink-soft sm:block"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-brand/15 bg-brand-soft text-brand-strong">
                  <HugeiconsIcon
                    icon={icon}
                    size={16}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>
                <span className="sm:mt-1.5 sm:block">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative min-h-[16rem] overflow-hidden rounded-2xl bg-surface-muted sm:min-h-[20rem] lg:min-h-[21rem]">
            <Image
              src={HERO_IMAGE}
              alt="Students collaborating on a project together"
              fill
              priority
              sizes="(min-width: 1024px) 620px, 100vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-contrast/35 via-transparent to-transparent"
            />
          </div>
          {idea ? (
            <div className="relative mt-3 lg:absolute lg:bottom-4 lg:right-4 lg:mt-0 lg:w-[22rem]">
              <DiscoveryHeroFeatured idea={idea} />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function ResultViewToggle({
  onChange,
  value,
}: {
  onChange: (view: IdeaResultView) => void;
  value: IdeaResultView;
}) {
  const options = [
    { icon: GridViewIcon, label: "Grid", value: "grid" },
    { icon: ListViewIcon, label: "List", value: "list" },
  ] as const satisfies readonly {
    icon: IconSvgElement;
    label: string;
    value: IdeaResultView;
  }[];

  return (
    <div
      role="group"
      aria-label="Result layout"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5"
    >
      {options.map(({ icon, label, value: optionValue }) => {
        const selected = value === optionValue;

        return (
          <button
            key={optionValue}
            type="button"
            aria-label={`${label} view`}
            aria-pressed={selected}
            onClick={() => onChange(optionValue)}
            className={`grid size-9 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected
                ? "bg-brand-soft text-brand-strong"
                : "text-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            <HugeiconsIcon
              icon={icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "gap")[] = [1];
  if (current > 3) pages.push("gap");
  for (
    let page = Math.max(2, current - 1);
    page <= Math.min(total - 1, current + 1);
    page += 1
  ) {
    pages.push(page);
  }
  if (current < total - 2) pages.push("gap");
  pages.push(total);

  return pages;
}

function Pagination({
  current,
  onChange,
  total,
}: {
  current: number;
  onChange: (page: number) => void;
  total: number;
}) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Idea result pages"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="grid size-10 place-items-center rounded-lg border border-border bg-surface text-ink transition-colors hover:border-brand/35 hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <HugeiconsIcon
          icon={ChevronLeftIcon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {pageNumbers(current, total).map((page, index) =>
        page === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="grid size-10 place-items-center text-sm text-muted"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-label={`Page ${page}`}
            aria-current={page === current ? "page" : undefined}
            onClick={() => onChange(page)}
            className={`grid size-10 place-items-center rounded-lg border text-sm font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              page === current
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-ink hover:border-brand/35 hover:text-brand-strong"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="grid size-10 place-items-center rounded-lg border border-border bg-surface text-ink transition-colors hover:border-brand/35 hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <HugeiconsIcon
          icon={ChevronRightIcon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}

/**
 * Public idea discovery.
 *
 * Filters live in the URL through a shallow history update, so a search or a
 * category can be shared, bookmarked, and restored with the back button without
 * a server round trip. The catalogue is intentionally scoped to public ideas:
 * a private idea is unlisted, not locked, and has no place in this grid.
 */
export function IdeasDashboard({
  data,
  initialState = defaultIdeaFilters,
  primaryAction,
  sponsoredSlot,
  topics,
  viewer = "authenticated",
}: {
  data: IdeasDiscoveryData;
  initialState?: IdeaFilterState;
  primaryAction?: { href: string; label: string };
  /**
   * A server-selected, labelled paid placement. It is rendered after the sixth
   * organic idea and never enters filtering, sorting, pagination, or counts.
   */
  sponsoredSlot?: ReactNode;
  topics: readonly Topic[];
  viewer?: "authenticated" | "visitor";
}) {
  const [state, setState] = useState<IdeaFilterState>(initialState);
  const publicIdeas = useMemo(() => allPublicIdeas(data), [data]);
  const categoryCounts = useMemo(
    () => countIdeasByCategory(publicIdeas),
    [publicIdeas],
  );
  const subcategoryCounts = useMemo(
    () => ideaSubcategoryCountsByCategory(publicIdeas),
    [publicIdeas],
  );
  const filteredIdeas = useMemo(
    () => filterAndSortIdeas(publicIdeas, state, "public"),
    [publicIdeas, state],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredIdeas.length / IDEA_PAGE_SIZE),
  );
  const currentPage = Math.min(state.page, pageCount);
  const visibleIdeas = filteredIdeas.slice(
    (currentPage - 1) * IDEA_PAGE_SIZE,
    currentPage * IDEA_PAGE_SIZE,
  );
  const chips = activeFilterChips(state);
  const tab = activeSortTab(state);
  // One featured idea still belongs in the hero. Several become a carousel:
  // stacking them into the hero would either hide the rest or make the hero
  // taller than the page it introduces.
  const showFeaturedCarousel = data.featured.length > 1;
  const heroFeatured = showFeaturedCarousel
    ? undefined
    : (data.featured[0] ?? publicIdeas[0]);

  useEffect(() => {
    const query = ideaFiltersToQuery(state);
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query}`,
    );
  }, [state]);

  useEffect(() => {
    function handlePopState() {
      setState(ideaFiltersFromSearch(window.location.search));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function update(patch: Partial<IdeaFilterState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function clearFilters() {
    setState(defaultIdeaFilters);
  }

  function removeChip(key: ActiveFilterChip["key"]) {
    if (key === "query") {
      update({ page: 1, query: "" });
      return;
    }
    if (key === "category") {
      update({ category: "all", page: 1, subcategory: "all" });
      return;
    }
    update({ [key]: "all", page: 1 });
  }

  return (
    <>
      <DiscoveryHero idea={heroFeatured} />

      {showFeaturedCarousel ? (
        <Container>
          <FeaturedCarousel ideas={data.featured} />
        </Container>
      ) : null}

      <Container className="py-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
          <FilterSidebar
            activeFilterCount={chips.length}
            categoryCounts={categoryCounts}
            onChange={update}
            onClear={clearFilters}
            state={state}
            subcategoryCounts={subcategoryCounts}
          />

          <div className="min-w-0" id="idea-results">
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div role="search" className="relative w-full sm:max-w-xs">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <Input
                  type="search"
                  aria-label="Search ideas"
                  value={state.query}
                  onChange={(event) =>
                    update({
                      page: 1,
                      query: event.target.value.slice(0, 120),
                    })
                  }
                  placeholder="Search ideas or creators"
                  className="min-h-10 pl-10 pr-9 text-sm"
                />
                {state.query ? (
                  <button
                    type="button"
                    aria-label="Clear idea search"
                    onClick={() => update({ page: 1, query: "" })}
                    className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p
                  className="text-xs tabular-nums text-muted sm:text-sm"
                  aria-live="polite"
                >
                  {filteredIdeas.length.toLocaleString("en-US")}{" "}
                  {filteredIdeas.length === 1 ? "idea" : "ideas"}
                  <span className="hidden sm:inline"> · Preview data</span>
                </p>
                <div className="flex items-center gap-2">
                  <ResultViewToggle
                    value={state.view}
                    onChange={(view) => update({ view })}
                  />
                  {primaryAction ? (
                    <Link
                      href={primaryAction.href}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {primaryAction.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              role="group"
              aria-label="Sort ideas"
              className="-mx-5 mt-2 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0"
            >
              {sortTabs.map((item) => {
                const selected = tab === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setState((current) =>
                        filtersForSortTab(current, item.key),
                      )
                    }
                    className={`relative inline-flex min-h-11 shrink-0 items-center px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      selected
                        ? "font-semibold text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-brand"
                        : "font-medium text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {chips.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-2.5 text-xs font-medium text-brand-strong transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {chip.label}
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={12}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span className="sr-only">Remove filter</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-8 rounded-full px-2 text-xs font-semibold text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  Clear all
                </button>
              </div>
            ) : null}

            {filteredIdeas.length > 0 ? (
              <>
                <section aria-labelledby="idea-grid-title" className="mt-5">
                  <h2 id="idea-grid-title" className="sr-only">
                    Idea results
                  </h2>
                  <ul
                    className={
                      state.view === "grid"
                        ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                        : "grid gap-3"
                    }
                  >
                    {visibleIdeas.map((idea, index) => (
                      <Fragment key={idea.id}>
                        <li className="grid">
                          <IdeaDiscoveryCard idea={idea} variant={state.view} />
                        </li>
                        {index === 5 &&
                        sponsoredSlot &&
                        visibleIdeas.length >= 6 ? (
                          <li className="grid">{sponsoredSlot}</li>
                        ) : null}
                      </Fragment>
                    ))}
                  </ul>
                </section>

                <Pagination
                  current={currentPage}
                  total={pageCount}
                  onChange={(page) => update({ page })}
                />
              </>
            ) : (
              <div className="mt-6">
                <StatePanel
                  variant="empty"
                  eyebrow="No matching ideas"
                  title="Try a broader search"
                  description="Change the category, subcategory, location, or validation stage to discover more ideas."
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
          </div>
        </div>

        <TopicDirectory ideas={publicIdeas} topics={topics} />

        {viewer === "visitor" ? (
          <aside className="mb-2 mt-2 flex flex-col gap-5 overflow-hidden rounded-2xl bg-contrast px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <Pill tone="accent" className="bg-brand/20 text-white">
                Shape what gets built
              </Pill>
              <h2 className="mt-3 text-xl font-bold tracking-[-0.03em] sm:text-2xl">
                Support, give feedback, or record a pre-pledge.
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/70">
                Create an account to take part. A pre-pledge records intent
                only. No money moves at this stage.
              </p>
            </div>
            <Link
              href="/auth"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-contrast focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
            >
              Create account
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </Link>
          </aside>
        ) : null}
      </Container>
    </>
  );
}
