"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Activity01Icon,
  Cancel01Icon,
  FilterIcon,
  Folder01Icon,
  GridViewIcon,
  ListViewIcon,
  Location01Icon,
  MoneyBag02Icon,
  PercentIcon,
  Search01Icon,
  StarIcon,
  Tag01Icon,
  Target02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { Container } from "@/components/ui/container";
import { CountryFlag } from "@/components/ui/country-flag";
import { FilterSection } from "@/components/ui/filter-section";
import { Input } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { Select } from "@/components/ui/select";
import { StatePanel } from "@/components/ui/state-panel";
import { CampaignCard } from "@/features/campaigns/components/campaign-card";
import {
  activeFilterChips,
  campaignCategoryCounts,
  campaignCountryCounts,
  campaignFilterQuery,
  campaignGoalCounts,
  campaignGoalFilterLabels,
  campaignPercentCounts,
  campaignPercentFilterLabels,
  campaignPhaseFilterLabels,
  campaignRaisedCounts,
  campaignRaisedFilterLabels,
  campaignRegionCounts,
  campaignShowFilterLabels,
  campaignSubcategoryCountsByCategory,
  defaultCampaignFilters,
  filterCampaigns,
  hasActiveFilters,
  parseCampaignFilters,
  subcategoriesForCategory,
  withCategory,
  withSubcategory,
  withoutFilter,
} from "@/features/campaigns/lib/filters";
import {
  CAMPAIGN_PAGE_SIZE,
  hasMoreCampaigns,
  nextVisibleCount,
  viewedLabel,
  visibleCampaigns,
} from "@/features/campaigns/lib/pagination";
import {
  campaignCategories,
  type CampaignCategoryNode,
  type CampaignSubcategoryNode,
} from "@/features/campaigns/lib/taxonomy";
import { useSavedCampaignIds } from "@/features/campaigns/lib/use-saved-campaign-ids";
import type {
  Campaign,
  CampaignFilters,
  CampaignGoalFilter,
  CampaignPercentFilter,
  CampaignPhaseFilter,
  CampaignRaisedFilter,
  CampaignShowFilter,
  CampaignSort,
} from "@/features/campaigns/types";

/**
 * Campaign discovery.
 *
 * The filter state is local and mirrored into the query string, so results
 * appear as you type while the URL stays shareable. Filter changes are pushed
 * (debounced) rather than replaced, and the query string is read back when it
 * changes, so browser back and forward restore the exact discovery state.
 *
 * Filtering and pagination run through pure helpers shared with the server
 * adapters. The preview has the whole result in memory; the count is therefore
 * a real filtered count, never an invented total.
 */

const sortOptions = [
  { value: "ending-soon", label: "Ending soon" },
  { value: "most-funded", label: "Funding progress" },
  { value: "newest", label: "Newest" },
  { value: "recently-updated", label: "Recently updated" },
] as const satisfies readonly { value: CampaignSort; label: string }[];

const phaseOptions = (
  Object.keys(campaignPhaseFilterLabels) as CampaignPhaseFilter[]
).map((value) => ({ value, label: campaignPhaseFilterLabels[value] }));

type DiscoveryScope = {
  category: CampaignCategoryNode;
  subcategory: CampaignSubcategoryNode | null;
};

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

type FilterOption = {
  count?: number;
  /** ISO country code when the option is a country, so the row can show a flag. */
  countryCode?: string | undefined;
  disabled?: boolean | undefined;
  hint?: string | undefined;
  label: string;
  value: string;
};

function FilterRadioGroup({
  idPrefix,
  legend,
  onChange,
  options,
  scrollable = false,
  value,
}: {
  idPrefix: string;
  legend: string;
  onChange: (value: string) => void;
  options: readonly FilterOption[];
  scrollable?: boolean;
  value: string;
}) {
  return (
    <fieldset aria-label={legend}>
      <div
        className={`space-y-0.5 ${
          scrollable ? "max-h-64 overflow-y-auto overscroll-contain pr-1" : ""
        }`}
      >
        {options.map((option, index) => {
          const active = option.value === value;
          const disabled = option.disabled === true;
          const id = `${idPrefix}-${index}`;
          const hintId = `${id}-hint`;

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`flex min-h-10 items-center justify-between gap-2 rounded-lg px-2.5 text-sm transition-colors ${
                disabled
                  ? "cursor-not-allowed text-muted"
                  : active
                    ? "bg-brand/10 font-semibold text-brand-strong ring-1 ring-inset ring-brand/20"
                    : "cursor-pointer text-ink hover:bg-surface"
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  id={id}
                  type="radio"
                  name={`${idPrefix}-group`}
                  value={option.value}
                  checked={active}
                  disabled={disabled}
                  onChange={() => onChange(option.value)}
                  aria-label={
                    option.count !== undefined
                      ? `${option.label} ${option.count}`
                      : option.label
                  }
                  aria-describedby={option.hint ? hintId : undefined}
                  className="size-4 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                />
                {option.countryCode ? (
                  <CountryFlag code={option.countryCode} />
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.hint ? (
                    <span
                      id={hintId}
                      className="mt-0.5 block text-[0.6875rem] font-normal leading-4 text-muted"
                    >
                      {option.hint}
                    </span>
                  ) : null}
                </span>
              </span>
              {option.count !== undefined ? (
                <span
                  className={`shrink-0 text-xs tabular-nums ${
                    active && !disabled ? "text-brand-strong" : "text-muted"
                  }`}
                >
                  {option.count}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function CategoryShortcuts({
  categoryCounts,
  onChange,
  totalPublic,
  value,
}: {
  categoryCounts: Readonly<Record<string, number>>;
  onChange: (value: CampaignFilters["category"]) => void;
  totalPublic: number;
  value: CampaignFilters["category"];
}) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0"
    >
      <button
        type="button"
        onClick={() => onChange("all")}
        aria-pressed={value === "all"}
        className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          value === "all"
            ? "border-brand bg-brand font-semibold text-white shadow-sm"
            : "border-border bg-surface font-medium text-ink hover:border-brand/35 hover:bg-canvas"
        }`}
      >
        All
        <span
          className={`text-xs tabular-nums ${
            value === "all" ? "text-white/75" : "text-muted"
          }`}
        >
          {totalPublic}
        </span>
      </button>
      {campaignCategories.map((category) => {
        const active = value === category.slug;

        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => onChange(category.slug)}
            aria-pressed={active}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "border-brand bg-brand font-semibold text-white shadow-sm"
                : "border-border bg-surface font-medium text-ink hover:border-brand/35 hover:bg-canvas"
            }`}
          >
            {category.label}
            <span
              className={`text-xs tabular-nums ${
                active ? "text-white/75" : "text-muted"
              }`}
            >
              {categoryCounts[category.slug] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DiscoveryFilters({
  categoryCounts,
  filters,
  goalCounts,
  idPrefix,
  countryCounts,
  onChange,
  percentCounts,
  raisedCounts,
  regionCounts,
  scope,
  showOptions,
  subcategoryCounts,
  totalPublic,
}: {
  categoryCounts: Readonly<Record<string, number>>;
  filters: CampaignFilters;
  goalCounts: Readonly<Record<CampaignGoalFilter, number>>;
  idPrefix: string;
  countryCounts: readonly { code: string; count: number; name: string }[];
  onChange: (filters: CampaignFilters) => void;
  percentCounts: Readonly<Record<CampaignPercentFilter, number>>;
  raisedCounts: Readonly<Record<CampaignRaisedFilter, number>>;
  regionCounts: readonly { count: number; label: string; value: string }[];
  scope?: DiscoveryScope | undefined;
  showOptions: readonly FilterOption[];
  subcategoryCounts: Readonly<Record<string, Readonly<Record<string, number>>>>;
  totalPublic: number;
}) {
  const subcategories = subcategoriesForCategory(filters.category);
  const categoryOptions: readonly FilterOption[] = [
    { count: totalPublic, label: "All categories", value: "all" },
    ...campaignCategories.map((category) => ({
      count: categoryCounts[category.slug] ?? 0,
      label: category.label,
      value: category.slug,
    })),
  ];
  const subcategoryOptions: readonly FilterOption[] = [
    { label: "All subcategories", value: "all" },
    ...subcategories.map((subcategory) => ({
      count: subcategoryCounts[filters.category]?.[subcategory.slug] ?? 0,
      label: subcategory.label,
      value: subcategory.slug,
    })),
  ];
  const goalOptions: readonly FilterOption[] = (
    Object.keys(campaignGoalFilterLabels) as CampaignGoalFilter[]
  ).map((value) => ({
    count: value === "all" ? totalPublic : (goalCounts[value] ?? 0),
    label: campaignGoalFilterLabels[value],
    value,
  }));
  const raisedOptions: readonly FilterOption[] = (
    Object.keys(campaignRaisedFilterLabels) as CampaignRaisedFilter[]
  ).map((value) => ({
    count: value === "all" ? totalPublic : (raisedCounts[value] ?? 0),
    label: campaignRaisedFilterLabels[value],
    value,
  }));
  const percentOptions: readonly FilterOption[] = (
    Object.keys(campaignPercentFilterLabels) as CampaignPercentFilter[]
  ).map((value) => ({
    count: value === "all" ? totalPublic : (percentCounts[value] ?? 0),
    label: campaignPercentFilterLabels[value],
    value,
  }));
  const countryOptions: readonly FilterOption[] = [
    { count: totalPublic, label: "All countries", value: "all" },
    ...countryCounts.map((country) => ({
      count: country.count,
      countryCode: country.code,
      label: country.name,
      value: country.code,
    })),
  ];
  const selectedCountryCount =
    countryCounts.find((country) => country.code === filters.country)?.count ??
    0;
  const regionOptions: readonly FilterOption[] = [
    { count: selectedCountryCount, label: "All regions", value: "all" },
    ...regionCounts.map((region) => ({
      count: region.count,
      label: region.label,
      value: region.value,
    })),
  ];

  return (
    <div className="space-y-3">
      {!scope ? (
        <FilterSection
          icon={Folder01Icon}
          label="Category"
          count={filters.category !== "all" ? 1 : undefined}
        >
          <FilterRadioGroup
            idPrefix={`${idPrefix}-category`}
            legend="Category"
            value={filters.category}
            options={categoryOptions}
            onChange={(value) =>
              onChange(
                withCategory(filters, value as CampaignFilters["category"]),
              )
            }
            scrollable
          />
        </FilterSection>
      ) : (
        <div className="rounded-xl border border-border bg-canvas/60 p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-brand/10 text-brand-strong">
              <HugeiconsIcon
                icon={Folder01Icon}
                size={15}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Category
            </p>
          </div>
          <p className="mt-2 text-sm font-semibold text-brand-strong">
            {scope.subcategory?.label ?? scope.category.label}
          </p>
        </div>
      )}

      {!scope && filters.category !== "all" && subcategories.length > 0 ? (
        <FilterSection
          icon={Tag01Icon}
          label="Subcategory"
          count={filters.subcategory !== "all" ? 1 : undefined}
        >
          <FilterRadioGroup
            idPrefix={`${idPrefix}-subcategory`}
            legend="Subcategory"
            value={filters.subcategory}
            options={subcategoryOptions}
            onChange={(value) =>
              onChange(
                withSubcategory(
                  filters,
                  value as CampaignFilters["subcategory"],
                ),
              )
            }
          />
        </FilterSection>
      ) : null}

      <FilterSection
        icon={Activity01Icon}
        label="Project status"
        count={filters.phase !== "all" ? 1 : undefined}
      >
        <FilterRadioGroup
          idPrefix={`${idPrefix}-phase`}
          legend="Project status"
          value={filters.phase}
          options={phaseOptions}
          onChange={(value) =>
            onChange({ ...filters, phase: value as CampaignPhaseFilter })
          }
        />
      </FilterSection>

      <FilterSection
        icon={Location01Icon}
        label="Location"
        count={
          filters.country !== "all" || filters.region !== "all" ? 1 : undefined
        }
        defaultOpen={filters.country !== "all" || filters.region !== "all"}
      >
        <p className="mb-1.5 px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Country
        </p>
        <FilterRadioGroup
          idPrefix={`${idPrefix}-country`}
          legend="Country"
          value={filters.country}
          options={countryOptions}
          onChange={(value) =>
            onChange({ ...filters, country: value, region: "all" })
          }
          scrollable
        />

        {filters.country !== "all" && regionCounts.length > 0 ? (
          <>
            <p className="mb-1.5 mt-3 px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
              Region
            </p>
            <FilterRadioGroup
              idPrefix={`${idPrefix}-region`}
              legend="Region"
              value={filters.region}
              options={regionOptions}
              onChange={(value) => onChange({ ...filters, region: value })}
              scrollable
            />
          </>
        ) : null}

        {filters.country !== "all" && regionCounts.length === 0 ? (
          <p className="mt-2 px-1 text-xs leading-5 text-muted">
            No regional breakdown for this country yet.
          </p>
        ) : null}
      </FilterSection>

      <FilterSection
        icon={Target02Icon}
        label="Goal"
        count={filters.goal !== "all" ? 1 : undefined}
        defaultOpen={filters.goal !== "all"}
      >
        <FilterRadioGroup
          idPrefix={`${idPrefix}-goal`}
          legend="Goal"
          value={filters.goal}
          options={goalOptions}
          onChange={(value) =>
            onChange({ ...filters, goal: value as CampaignGoalFilter })
          }
        />
      </FilterSection>

      <FilterSection
        icon={MoneyBag02Icon}
        label="Amount raised"
        count={filters.raised !== "all" ? 1 : undefined}
        defaultOpen={filters.raised !== "all"}
      >
        <FilterRadioGroup
          idPrefix={`${idPrefix}-raised`}
          legend="Amount raised"
          value={filters.raised}
          options={raisedOptions}
          onChange={(value) =>
            onChange({ ...filters, raised: value as CampaignRaisedFilter })
          }
        />
      </FilterSection>

      <FilterSection
        icon={PercentIcon}
        label="Percent raised"
        count={filters.percent !== "all" ? 1 : undefined}
        defaultOpen={filters.percent !== "all"}
      >
        <FilterRadioGroup
          idPrefix={`${idPrefix}-percent`}
          legend="Percent raised"
          value={filters.percent}
          options={percentOptions}
          onChange={(value) =>
            onChange({ ...filters, percent: value as CampaignPercentFilter })
          }
        />
      </FilterSection>

      <FilterSection
        icon={StarIcon}
        label="Show only"
        count={filters.show !== "all" ? 1 : undefined}
      >
        <FilterRadioGroup
          idPrefix={`${idPrefix}-show`}
          legend="Show only"
          value={filters.show}
          options={showOptions}
          onChange={(value) =>
            onChange({ ...filters, show: value as CampaignShowFilter })
          }
        />
      </FilterSection>
    </div>
  );
}

export function CampaignDiscovery({
  candidates,
  categoryCounts,
  description,
  emptyDescription,
  emptyTitle,
  featuredCandidates = [],
  heading = "Explore campaigns",
  initialFilters,
  nowIso,
  recommendationReasons,
  scope,
  searchPlaceholder = "Search campaigns, creators, or places",
  showCategoryShortcuts = true,
  sponsoredSlot,
  subcategoryCounts,
  totalPublic,
}: {
  candidates: readonly Campaign[];
  categoryCounts: Readonly<Record<string, number>>;
  description?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  /** Featured campaigns, available to the "Projects We Love" view. */
  featuredCandidates?: readonly Campaign[];
  heading?: string | null;
  initialFilters: CampaignFilters;
  nowIso: string;
  /** Plain-language reasons, keyed by campaign id, for a recommendation list. */
  recommendationReasons?: Readonly<Record<string, string>>;
  scope?: DiscoveryScope;
  searchPlaceholder?: string;
  showCategoryShortcuts?: boolean;
  /**
   * A server-selected, labelled paid placement. It is rendered after the sixth
   * organic result and never enters `filterCampaigns`, the result count, or the
   * sort order.
   */
  sponsoredSlot?: ReactNode;
  subcategoryCounts: Readonly<Record<string, Readonly<Record<string, number>>>>;
  totalPublic: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const savedIds = useSavedCampaignIds();
  const [pendingWrite, setPendingWrite] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<CampaignFilters>(() =>
    scope
      ? { ...initialFilters, category: "all", subcategory: "all" }
      : initialFilters,
  );
  const [pagination, setPagination] = useState({
    key: campaignFilterQuery(initialFilters),
    visible: CAMPAIGN_PAGE_SIZE,
  });

  const readFilters = useCallback(
    (params: URLSearchParams): CampaignFilters => {
      const parsed = parseCampaignFilters(Object.fromEntries(params.entries()));
      return scope
        ? { ...parsed, category: "all", subcategory: "all" }
        : parsed;
    },
    [scope],
  );

  const serialised = campaignFilterQuery(filters);
  const urlSerialised = campaignFilterQuery(readFilters(searchParams));
  const [lastUrlSerialised, setLastUrlSerialised] = useState(urlSerialised);

  // URL -> state during render (not in an effect), the React pattern for
  // adjusting state when external input changes. A write this component started
  // is acknowledged without discarding a newer keystroke; any other URL change
  // is a browser back or forward and is applied.
  if (urlSerialised !== lastUrlSerialised) {
    setLastUrlSerialised(urlSerialised);
    if (urlSerialised === pendingWrite) {
      setPendingWrite(null);
    } else {
      const next = readFilters(searchParams);
      if (campaignFilterQuery(filters) !== urlSerialised) {
        setFilters(next);
      }
    }
  }

  // Reset load-more progress when the result query changes. Derived during
  // render instead of in an effect, so the first paint after a filter change is
  // already the first page.
  if (pagination.key !== serialised) {
    setPagination({ key: serialised, visible: CAMPAIGN_PAGE_SIZE });
  }
  const visibleCount =
    pagination.key === serialised ? pagination.visible : CAMPAIGN_PAGE_SIZE;

  // Debounced URL write. `push` gives back/forward something to restore; the
  // delay keeps a typed query from creating a history entry per keystroke.
  useEffect(() => {
    if (searchParams.toString() === serialised) return;

    const timeout = window.setTimeout(() => {
      setPendingWrite(serialised);
      startTransition(() => {
        router.push(serialised ? `${pathname}?${serialised}` : pathname, {
          scroll: false,
        });
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams, serialised]);

  const allForShow = useMemo(() => {
    const seen = new Set<string>();
    return [...candidates, ...featuredCandidates].filter((campaign) => {
      if (seen.has(campaign.id)) return false;
      seen.add(campaign.id);
      return true;
    });
  }, [candidates, featuredCandidates]);

  // Each cross-cutting view draws from the pool that can honestly satisfy it.
  // "Projects We Love" is the stored editorial flag, "Saved projects" is the
  // browser-local list, and "Open to backers" is the funding phase.
  const showPool = useMemo(() => {
    switch (filters.show) {
      case "loved":
        return featuredCandidates;
      case "saved":
        return allForShow.filter((campaign) => savedIds.has(campaign.id));
      case "open":
        return allForShow.filter((campaign) => campaign.phase === "funding");
      case "all":
        return candidates;
    }
  }, [allForShow, candidates, featuredCandidates, filters.show, savedIds]);

  const results = useMemo(
    () => filterCampaigns(showPool, filters, { savedIds }),
    [filters, savedIds, showPool],
  );

  // Counts follow the visible pool. They are real filtered counts, never a
  // platform-wide total the preview cannot know.
  const activeCategoryCounts =
    filters.show === "all" ? categoryCounts : campaignCategoryCounts(showPool);
  const activeSubcategoryCounts =
    filters.show === "all"
      ? subcategoryCounts
      : campaignSubcategoryCountsByCategory(showPool);
  const goalCounts = useMemo(() => campaignGoalCounts(showPool), [showPool]);
  const raisedCounts = useMemo(
    () => campaignRaisedCounts(showPool),
    [showPool],
  );
  const percentCounts = useMemo(
    () => campaignPercentCounts(showPool),
    [showPool],
  );
  const countryCounts = useMemo(
    () => campaignCountryCounts(showPool),
    [showPool],
  );
  const regionCounts = useMemo(
    () => campaignRegionCounts(showPool, filters.country),
    [filters.country, showPool],
  );
  const poolTotal = showPool.length;
  const savedCount = allForShow.filter((campaign) =>
    savedIds.has(campaign.id),
  ).length;
  const openCount = allForShow.filter(
    (campaign) => campaign.phase === "funding",
  ).length;
  const showOptions: readonly FilterOption[] = [
    {
      count: totalPublic,
      label: campaignShowFilterLabels.all,
      value: "all",
    },
    {
      count: featuredCandidates.length,
      disabled: featuredCandidates.length === 0,
      hint:
        featuredCandidates.length === 0
          ? "No featured campaigns in this view yet."
          : undefined,
      label: campaignShowFilterLabels.loved,
      value: "loved",
    },
    {
      count: savedCount,
      label: campaignShowFilterLabels.saved,
      value: "saved",
    },
    {
      count: openCount,
      label: campaignShowFilterLabels.open,
      value: "open",
    },
    {
      disabled: true,
      hint: "Personal picks need an account. Open a campaign to see its recommendations.",
      label: "Recommended for you",
      value: "recommended",
    },
  ];

  const visible = visibleCampaigns(results, visibleCount);
  const loaded = visible.length;
  const more = hasMoreCampaigns(results.length, visibleCount);
  const chips = activeFilterChips(filters);
  const hasFilters = hasActiveFilters(filters);
  const categorySummary = description
    ? description
    : totalPublic === 1
      ? "1 campaign is open to discovery."
      : `${totalPublic} campaigns are open to discovery.`;

  function update(next: CampaignFilters) {
    setFilters(next);
  }

  function updateCategory(category: CampaignFilters["category"]) {
    update(withCategory(filters, category));
  }

  function reset() {
    update({ ...defaultCampaignFilters, view: filters.view });
  }

  function openFilters() {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }

  function closeFilters() {
    dialogRef.current?.close();
  }

  return (
    <div
      id="campaigns"
      className={`scroll-mt-24 transition-opacity ${isPending ? "opacity-80" : ""}`}
      aria-busy={isPending}
    >
      <Container>
        <div className="border-b border-border pb-6 pt-9 sm:pt-11">
          {heading ? (
            <>
              <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">
                {heading}
              </h2>
              <p className="mt-1 text-sm text-muted">{categorySummary}</p>
            </>
          ) : null}

          <div
            className={`flex flex-col gap-3 lg:flex-row lg:items-center ${heading ? "mt-5" : ""}`}
          >
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
                onChange={(event) =>
                  update({ ...filters, query: event.target.value })
                }
                placeholder={searchPlaceholder}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
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
                    update({ ...filters, sort: value as CampaignSort })
                  }
                />
              </div>
              <ViewToggle
                value={filters.view}
                onChange={(view) => update({ ...filters, view })}
              />
              <button
                type="button"
                onClick={openFilters}
                aria-controls="campaign-filters-dialog"
                aria-haspopup="dialog"
                aria-label={
                  hasFilters ? `Filters, ${chips.length} active` : "Filters"
                }
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
              >
                <HugeiconsIcon
                  icon={FilterIcon}
                  size={16}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                Filters
                {hasFilters ? (
                  <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
                    {chips.length}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {showCategoryShortcuts && !scope ? (
            <div className="mt-4">
              <CategoryShortcuts
                categoryCounts={activeCategoryCounts}
                value={filters.category}
                totalPublic={poolTotal}
                onChange={updateCategory}
              />
            </div>
          ) : null}

          {hasFilters ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted">
                Filtered by
              </span>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => update(withoutFilter(filters, chip.key))}
                  aria-label={`Remove filter ${chip.label}`}
                  className="inline-flex min-h-8 items-center gap-1 rounded-full border border-brand/30 bg-brand/8 px-2.5 text-xs font-semibold text-brand-strong transition-colors hover:border-brand/55 hover:bg-brand/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {chip.label}
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={12}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid gap-7 py-7 sm:py-9 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-9">
          <aside aria-label="Campaign filters" className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-strong">
                    <HugeiconsIcon
                      icon={FilterIcon}
                      size={15}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </span>
                  <h2 className="text-sm font-bold text-ink">Filters</h2>
                  {hasFilters ? (
                    <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
                      {chips.length}
                    </span>
                  ) : null}
                </div>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={reset}
                    className="shrink-0 text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <DiscoveryFilters
                idPrefix="desktop"
                filters={filters}
                onChange={update}
                scope={scope}
                categoryCounts={activeCategoryCounts}
                countryCounts={countryCounts}
                goalCounts={goalCounts}
                percentCounts={percentCounts}
                raisedCounts={raisedCounts}
                regionCounts={regionCounts}
                showOptions={showOptions}
                subcategoryCounts={activeSubcategoryCounts}
                totalPublic={poolTotal}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <p className="text-sm text-muted" role="status" aria-live="polite">
              {results.length === 1
                ? "1 campaign matches"
                : `${results.length} campaigns match`}
            </p>
            {results.length > 0 ? (
              <>
                <div
                  id="campaign-results"
                  className={`mt-4 ${
                    filters.view === "grid"
                      ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-4"
                  }`}
                >
                  {visible.map((campaign, index) => (
                    <Fragment key={campaign.id}>
                      <CampaignCard
                        campaign={campaign}
                        nowIso={nowIso}
                        recommendationReason={
                          recommendationReasons?.[campaign.id]
                        }
                        view={filters.view}
                        priority={index === 0}
                      />
                      {index === 5 && sponsoredSlot && results.length >= 6 ? (
                        <div className="grid">{sponsoredSlot}</div>
                      ) : null}
                    </Fragment>
                  ))}
                </div>

                {results.length > 1 ? (
                  <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-border bg-surface p-3.5 text-center">
                    <Meter
                      ratio={loaded / results.length}
                      label={
                        <span className="flex w-full flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="font-medium text-ink">
                            {viewedLabel(loaded, results.length)}
                          </span>
                          <span className="text-[11px] text-muted">
                            {Math.round((loaded / results.length) * 100)}%
                          </span>
                        </span>
                      }
                      srLabel="campaigns viewed"
                      size="sm"
                    />
                    <div className="mt-3 flex justify-center">
                      {more ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPagination({
                              key: serialised,
                              visible: nextVisibleCount(visibleCount),
                            })
                          }
                          aria-controls="campaign-results"
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-canvas px-4 text-xs font-semibold text-ink transition-colors hover:border-brand/45 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          Load more campaigns
                        </button>
                      ) : (
                        <p className="text-[11px] text-muted">
                          You’ve reached the end of these results.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-4">
                <StatePanel
                  variant="empty"
                  eyebrow={
                    hasFilters ? "No matching campaigns" : "No campaigns yet"
                  }
                  title={
                    emptyTitle ??
                    (hasFilters ? "Try a different filter" : "Nothing here yet")
                  }
                  description={
                    emptyDescription ??
                    (hasFilters
                      ? "No campaign matches the current search, category, and status. Clear the filters to see every campaign that is open to discovery."
                      : "There are no public campaigns in this view yet. Browse all campaigns to see what else is open.")
                  }
                  action={
                    hasFilters ? (
                      <button
                        type="button"
                        onClick={reset}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <Link
                        href="/campaigns"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        Browse all campaigns
                      </Link>
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      </Container>

      <dialog
        ref={dialogRef}
        id="campaign-filters-dialog"
        aria-labelledby="campaign-filters-title"
        className="fixed inset-x-0 bottom-0 m-0 max-h-[85vh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-border bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/45 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(28rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeFilters();
        }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-strong">
              <HugeiconsIcon
                icon={FilterIcon}
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </span>
            <h2
              id="campaign-filters-title"
              className="text-base font-bold text-ink"
            >
              Filters
            </h2>
            {hasFilters ? (
              <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
                {chips.length}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeFilters}
            className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="sr-only">Close filters</span>
          </button>
        </div>

        <div className="px-4 py-4">
          <DiscoveryFilters
            idPrefix="mobile"
            filters={filters}
            onChange={update}
            scope={scope}
            categoryCounts={activeCategoryCounts}
            countryCounts={countryCounts}
            goalCounts={goalCounts}
            percentCounts={percentCounts}
            raisedCounts={raisedCounts}
            regionCounts={regionCounts}
            showOptions={showOptions}
            subcategoryCounts={activeSubcategoryCounts}
            totalPublic={poolTotal}
          />
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-border bg-canvas px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={closeFilters}
            className="inline-flex min-h-11 flex-[1.4] items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {results.length === 1
              ? "Show 1 campaign"
              : `Show ${results.length} campaigns`}
          </button>
        </div>
      </dialog>
    </div>
  );
}
