import { fundedPercent } from "@/features/campaigns/lib/amounts";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import {
  campaignCategoryLabel,
  campaignCategoryPath,
  campaignSubcategoryLabel,
  findCampaignCategory,
  findCampaignSubcategory,
  isCampaignCategorySlug,
  isCampaignSubcategoryOf,
  type CampaignCategorySlug,
  type CampaignSubcategorySlug,
} from "@/features/campaigns/lib/taxonomy";
import {
  CAMPAIGN_MONEY_RANGES,
  isCampaignGoalFilter,
  isCampaignPercentFilter,
  isCampaignPhaseFilter,
  isCampaignRaisedFilter,
  isCampaignShowFilter,
  isCampaignSort,
  isCampaignView,
  type Campaign,
  type CampaignFilters,
  type CampaignGoalFilter,
  type CampaignMoneyRange,
  type CampaignPercentFilter,
  type CampaignPhaseFilter,
  type CampaignRaisedFilter,
  type CampaignShowFilter,
  type CampaignTaxonomy,
} from "@/features/campaigns/types";
import {
  discoveryCategories,
  type DiscoveryCategory,
} from "@/features/home/discovery-categories";
import {
  countryCodeFromName,
  countryName,
  normaliseCountryCode,
} from "@/lib/countries";
import type { MoneyAmount } from "@/lib/money";

/** The label for the obsolete six-value campaign category. Compatibility only. */
export function legacyCategoryLabel(value: DiscoveryCategory): string {
  return (
    discoveryCategories.find((category) => category.value === value)?.label ??
    value
  );
}

function foldCountryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’‘]/g, "'")
    .trim()
    .toLowerCase();
}

/**
 * The ISO country code for a campaign location.
 *
 * Locations are display strings written by the creator ("Ogun State, Nigeria",
 * "Berlin, Germany"). The final comma-separated segment is the country, matched
 * against the shared ISO/CLDR list rather than a hand-written table. A location
 * with no recognised country returns `null`; callers group those honestly as
 * "Other locations" instead of guessing a country.
 */
export function campaignCountryCode(location: string): string | null {
  const segments = location
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const candidate = segments.at(-1);
  if (!candidate) return null;

  const direct = normaliseCountryCode(candidate);
  if (direct) return direct;

  return countryCodeFromName(candidate);
}

/** A country filter label, including the honest bucket for unmatched locations. */
export function campaignCountryLabel(code: string): string {
  return code === "unknown" ? "Other locations" : (countryName(code) ?? code);
}

/**
 * The part of a location inside its country, for the region filter.
 *
 * "Ogun State, Nigeria" becomes "Ogun State". A location that is only a country
 * name, or whose last segment is not its recognised country, is returned whole
 * rather than cut in the wrong place.
 */
export function campaignRegionLabel(location: string): string {
  const code = campaignCountryCode(location);
  const name = code ? countryName(code) : null;
  if (!name) return location;

  const segments = location
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const last = segments.at(-1);

  if (!last || foldCountryName(last) !== foldCountryName(name)) return location;

  return segments.slice(0, -1).join(", ") || location;
}

/** The display label for a campaign's taxonomy, falling back to its legacy value. */
export function campaignCategoryText(
  campaign: Pick<Campaign, "category" | "taxonomy">,
): string {
  return campaign.taxonomy
    ? campaignCategoryLabel(campaign.taxonomy.category)
    : legacyCategoryLabel(campaign.category);
}

/** The parent and child together, so a card never shows a bare "Comedy". */
export function campaignTaxonomyText(
  campaign: Pick<Campaign, "category" | "taxonomy">,
): string {
  if (!campaign.taxonomy) return legacyCategoryLabel(campaign.category);

  const parent = campaignCategoryLabel(campaign.taxonomy.category);
  return campaign.taxonomy.subcategory
    ? `${parent} / ${campaignSubcategoryLabel(
        campaign.taxonomy.category,
        campaign.taxonomy.subcategory,
      )}`
    : parent;
}

/**
 * The canonical category route for a campaign, or null when it has no
 * taxonomy assignment. A null result must not be turned into a legacy-labelled
 * category URL: no such route exists.
 */
export function campaignCategoryHref(
  campaign: Pick<Campaign, "category" | "taxonomy">,
): string | null {
  if (!campaign.taxonomy) return null;
  return campaignCategoryPath(
    campaign.taxonomy.category,
    campaign.taxonomy.subcategory,
  );
}

/**
 * Campaign discovery state.
 *
 * The filter state is the single source of truth for search, category,
 * subcategory, phase, sort, and view, and it round-trips through the query
 * string so a filtered discovery page is shareable. Category and subcategory
 * are stable slugs, never display labels.
 */

export const defaultCampaignFilters: CampaignFilters = {
  category: "all",
  country: "all",
  goal: "all",
  percent: "all",
  phase: "all",
  query: "",
  raised: "all",
  region: "all",
  show: "all",
  sort: "ending-soon",
  subcategory: "all",
  view: "grid",
};

type RawParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseCampaignFilters(params: RawParams): CampaignFilters {
  const query = firstValue(params.q).trim().slice(0, 120);
  const phase = firstValue(params.phase);
  const sort = firstValue(params.sort);
  const view = firstValue(params.view);
  const goal = firstValue(params.goal);
  const raised = firstValue(params.raised);
  const percent = firstValue(params.percent);
  const show = firstValue(params.show);
  const requestedCountry = firstValue(params.country).trim();
  // `location` is the pre-country-filter query value. It held a full place
  // string, so it is accepted as a country plus, when it names one, a region.
  const legacyLocation = firstValue(params.location).trim();
  const requestedPlace = requestedCountry || legacyLocation;
  const requestedRegion = firstValue(params.region).trim().slice(0, 120);
  const requestedCategory = firstValue(params.category);
  const requestedSubcategory = firstValue(params.subcategory);
  const category = isCampaignCategorySlug(requestedCategory)
    ? requestedCategory
    : "all";
  const subcategory =
    category !== "all" &&
    requestedSubcategory !== "" &&
    isCampaignSubcategoryOf(category, requestedSubcategory)
      ? (requestedSubcategory as CampaignSubcategorySlug)
      : "all";

  let country =
    requestedPlace === "unknown"
      ? "unknown"
      : (normaliseCountryCode(requestedPlace) ?? "all");
  if (country === "all" && requestedPlace !== "") {
    country = campaignCountryCode(requestedPlace) ?? "all";
  }

  let region = requestedRegion;
  if (region === "" && country !== "all" && legacyLocation !== "") {
    region = legacyLocation;
  }
  if (region !== "" && region !== "all") {
    const regionCountry = campaignCountryCode(region) ?? "unknown";
    if (country === "all" || regionCountry !== country) region = "all";
  } else {
    region = "all";
  }

  return {
    category,
    country,
    goal: isCampaignGoalFilter(goal) ? goal : "all",
    percent: isCampaignPercentFilter(percent) ? percent : "all",
    phase: isCampaignPhaseFilter(phase) ? phase : "all",
    query,
    raised: isCampaignRaisedFilter(raised) ? raised : "all",
    region,
    show: isCampaignShowFilter(show) ? show : "all",
    sort: isCampaignSort(sort) ? sort : defaultCampaignFilters.sort,
    subcategory,
    view: isCampaignView(view) ? view : defaultCampaignFilters.view,
  };
}

/** Serialise non-default values only, so an unfiltered page has a clean URL. */
export function campaignFilterQuery(filters: CampaignFilters): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.category !== "all" && filters.subcategory !== "all") {
    params.set("subcategory", filters.subcategory);
  }
  if (filters.phase !== "all") params.set("phase", filters.phase);
  if (filters.country !== "all") params.set("country", filters.country);
  if (filters.country !== "all" && filters.region !== "all") {
    params.set("region", filters.region);
  }
  if (filters.goal !== "all") params.set("goal", filters.goal);
  if (filters.raised !== "all") params.set("raised", filters.raised);
  if (filters.percent !== "all") params.set("percent", filters.percent);
  if (filters.show !== "all") params.set("show", filters.show);
  if (filters.sort !== defaultCampaignFilters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.view !== defaultCampaignFilters.view) {
    params.set("view", filters.view);
  }

  return params.toString();
}

export function hasActiveFilters(filters: CampaignFilters): boolean {
  return (
    filters.query !== "" ||
    filters.category !== "all" ||
    filters.subcategory !== "all" ||
    filters.phase !== "all" ||
    filters.country !== "all" ||
    filters.region !== "all" ||
    filters.goal !== "all" ||
    filters.raised !== "all" ||
    filters.percent !== "all" ||
    filters.show !== "all"
  );
}

function haystack(campaign: Campaign): string {
  return [
    campaign.title,
    campaign.summary,
    campaign.creator.name,
    campaign.location,
    campaign.category,
    legacyCategoryLabel(campaign.category),
    campaign.taxonomy ? campaignCategoryLabel(campaign.taxonomy.category) : "",
    campaign.taxonomy?.subcategory
      ? campaignSubcategoryLabel(
          campaign.taxonomy.category,
          campaign.taxonomy.subcategory,
        )
      : "",
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesQuery(campaign: Campaign, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const text = haystack(campaign);
  return terms.every((term) => text.includes(term));
}

function phaseMatches(campaign: Campaign, filters: CampaignFilters): boolean {
  if (filters.phase === "all") return isPublicPhase(campaign.phase);

  switch (filters.phase) {
    case "funding":
      // A paused campaign is public but is not accepting contributions, so it
      // is never described as "Funding open".
      return campaign.phase === "funding";
    case "live-delivery":
      return campaign.phase === "delivering";
    case "successful":
      return campaign.phase === "completed";
    case "unsuccessful":
      return campaign.phase === "funding-failed";
    case "paused":
      return campaign.phase === "paused";
  }
}

/**
 * Money bands are half-open: the lower bound is included and the upper bound is
 * not, so a campaign exactly on a boundary appears in one band only.
 */
function moneyRangeMatches(
  amount: MoneyAmount,
  range: CampaignMoneyRange,
): boolean {
  const atomic = BigInt(amount.atomic);

  switch (range) {
    case "under-10k":
      return atomic < 1_000_000n;
    case "10k-25k":
      return atomic >= 1_000_000n && atomic < 2_500_000n;
    case "25k-50k":
      return atomic >= 2_500_000n && atomic < 5_000_000n;
    case "50k-plus":
      return atomic >= 5_000_000n;
  }
}

export function matchesGoal(
  campaign: Campaign,
  goal: CampaignGoalFilter,
): boolean {
  return goal === "all" || moneyRangeMatches(campaign.funding.target, goal);
}

export function matchesRaised(
  campaign: Campaign,
  raised: CampaignRaisedFilter,
): boolean {
  if (raised === "all") return true;
  if (raised === "unreported") return campaign.funding.raised === null;
  return (
    campaign.funding.raised !== null &&
    moneyRangeMatches(campaign.funding.raised, raised)
  );
}

export function matchesPercent(
  campaign: Campaign,
  percent: CampaignPercentFilter,
): boolean {
  if (percent === "all") return true;

  const funded = fundedPercent(
    campaign.funding.raised,
    campaign.funding.target,
  );
  if (percent === "unreported") return funded === null;
  if (funded === null) return false;

  switch (percent) {
    case "under-25":
      return funded < 25;
    case "25-49":
      return funded >= 25 && funded < 50;
    case "50-74":
      return funded >= 50 && funded < 75;
    case "75-99":
      return funded >= 75 && funded < 100;
    case "100-plus":
      return funded >= 100;
  }
}

export function matchesCountry(campaign: Campaign, country: string): boolean {
  if (country === "all") return true;
  return (campaignCountryCode(campaign.location) ?? "unknown") === country;
}

export function matchesRegion(campaign: Campaign, region: string): boolean {
  return region === "all" || campaign.location === region;
}

function showMatches(
  campaign: Campaign,
  show: CampaignShowFilter,
  savedIds: ReadonlySet<string> | undefined,
): boolean {
  switch (show) {
    case "all":
      return true;
    case "loved":
      return campaign.featured;
    case "saved":
      // A saved filter without a saved set is an empty view, not every campaign.
      return savedIds?.has(campaign.id) ?? false;
    case "open":
      return campaign.phase === "funding";
  }
}

function taxonomyMatches(
  campaign: Campaign,
  filters: CampaignFilters,
): boolean {
  if (filters.category === "all") return true;
  if (campaign.taxonomy?.category !== filters.category) return false;
  if (filters.subcategory === "all") return true;
  return campaign.taxonomy.subcategory === filters.subcategory;
}

/**
 * Sort key. `unknown` campaigns and campaigns without a raised total go last in
 * "most funded" rather than being ranked as zero. The final slug comparison
 * makes every sort deterministic when two campaigns share a key.
 */
export function compareCampaigns(
  a: Campaign,
  b: Campaign,
  sort: CampaignFilters["sort"],
): number {
  switch (sort) {
    case "ending-soon": {
      const aLive = a.phase === "funding" ? 0 : 1;
      const bLive = b.phase === "funding" ? 0 : 1;
      if (aLive !== bLive) return aLive - bLive;
      const byClose = a.funding.closesAt.localeCompare(b.funding.closesAt);
      return byClose !== 0 ? byClose : a.slug.localeCompare(b.slug);
    }
    case "most-funded": {
      const aPercent = fundedPercent(a.funding.raised, a.funding.target);
      const bPercent = fundedPercent(b.funding.raised, b.funding.target);
      if (aPercent !== null && bPercent !== null && aPercent !== bPercent) {
        return bPercent - aPercent;
      }
      if (aPercent === null && bPercent !== null) return 1;
      if (aPercent !== null && bPercent === null) return -1;
      return a.slug.localeCompare(b.slug);
    }
    case "newest": {
      const byPublished = (b.publishedAt ?? "").localeCompare(
        a.publishedAt ?? "",
      );
      return byPublished !== 0 ? byPublished : a.slug.localeCompare(b.slug);
    }
    case "recently-updated": {
      const latest = (campaign: Campaign) =>
        campaign.updates.reduce(
          (most, update) => (update.createdAt > most ? update.createdAt : most),
          campaign.publishedAt ?? "",
        );
      const byUpdate = latest(b).localeCompare(latest(a));
      return byUpdate !== 0 ? byUpdate : a.slug.localeCompare(b.slug);
    }
  }
}

export function filterCampaigns(
  campaigns: readonly Campaign[],
  filters: CampaignFilters,
  options: { savedIds?: ReadonlySet<string> } = {},
): readonly Campaign[] {
  return campaigns
    .filter(
      (campaign) =>
        isPublicPhase(campaign.phase) &&
        showMatches(campaign, filters.show, options.savedIds) &&
        phaseMatches(campaign, filters) &&
        taxonomyMatches(campaign, filters) &&
        matchesCountry(campaign, filters.country) &&
        matchesRegion(campaign, filters.region) &&
        matchesGoal(campaign, filters.goal) &&
        matchesRaised(campaign, filters.raised) &&
        matchesPercent(campaign, filters.percent) &&
        matchesQuery(campaign, filters.query),
    )
    .sort((a, b) => compareCampaigns(a, b, filters.sort));
}

/**
 * Result counts per parent category. Counts include only public phases and only
 * campaigns with an explicit taxonomy assignment; an unassigned campaign is
 * counted in the All total but not attributed to a category it does not have.
 */
export function campaignCategoryCounts(
  campaigns: readonly Campaign[],
): Readonly<Record<string, number>> {
  return campaigns
    .filter(
      (campaign) => isPublicPhase(campaign.phase) && campaign.taxonomy !== null,
    )
    .reduce<Record<string, number>>((counts, campaign) => {
      const category = campaign.taxonomy?.category;
      if (!category) return counts;
      counts[category] = (counts[category] ?? 0) + 1;
      return counts;
    }, {});
}

/**
 * Subcategory counts grouped by parent, for a client that can change parent.
 * The map is built from the same public set as `campaignCategoryCounts`.
 */
export function campaignSubcategoryCountsByCategory(
  campaigns: readonly Campaign[],
): Readonly<Record<string, Readonly<Record<string, number>>>> {
  const counts: Record<string, Record<string, number>> = {};

  for (const campaign of campaigns) {
    if (!isPublicPhase(campaign.phase)) continue;
    const category = campaign.taxonomy?.category;
    const subcategory = campaign.taxonomy?.subcategory;
    if (!category || !subcategory) continue;

    counts[category] ??= {};
    counts[category][subcategory] = (counts[category][subcategory] ?? 0) + 1;
  }

  return counts;
}

/** Counts for the subcategories of one parent, from the same public set. */
export function campaignSubcategoryCounts(
  campaigns: readonly Campaign[],
  category: CampaignCategorySlug,
): Readonly<Record<string, number>> {
  return campaigns
    .filter(
      (campaign) =>
        isPublicPhase(campaign.phase) &&
        campaign.taxonomy?.category === category &&
        campaign.taxonomy.subcategory !== null,
    )
    .reduce<Record<string, number>>((counts, campaign) => {
      const subcategory = campaign.taxonomy?.subcategory;
      if (!subcategory) return counts;
      counts[subcategory] = (counts[subcategory] ?? 0) + 1;
      return counts;
    }, {});
}

export type FilterChip = {
  key:
    | "query"
    | "category"
    | "subcategory"
    | "phase"
    | "country"
    | "region"
    | "goal"
    | "raised"
    | "percent"
    | "show";
  label: string;
};

/** The chips a backer can remove, in the order the controls appear. */
export function activeFilterChips(filters: CampaignFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.query) chips.push({ key: "query", label: `“${filters.query}”` });
  if (filters.category !== "all") {
    chips.push({
      key: "category",
      label: campaignCategoryLabel(filters.category),
    });
  }
  if (filters.category !== "all" && filters.subcategory !== "all") {
    const subcategory = findCampaignSubcategory(
      filters.category,
      filters.subcategory,
    );
    if (subcategory) {
      chips.push({ key: "subcategory", label: subcategory.label });
    }
  }
  if (filters.phase !== "all") {
    chips.push({
      key: "phase",
      label: campaignPhaseFilterLabels[filters.phase],
    });
  }
  if (filters.country !== "all") {
    chips.push({
      key: "country",
      label: campaignCountryLabel(filters.country),
    });
  }
  if (filters.country !== "all" && filters.region !== "all") {
    chips.push({
      key: "region",
      label: campaignRegionLabel(filters.region),
    });
  }
  if (filters.goal !== "all") {
    chips.push({
      key: "goal",
      label: `Goal: ${campaignGoalFilterLabels[filters.goal]}`,
    });
  }
  if (filters.raised !== "all") {
    chips.push({
      key: "raised",
      label: `Raised: ${campaignRaisedFilterLabels[filters.raised]}`,
    });
  }
  if (filters.percent !== "all") {
    chips.push({
      key: "percent",
      label: `Funded: ${campaignPercentFilterLabels[filters.percent]}`,
    });
  }
  if (filters.show !== "all") {
    chips.push({
      key: "show",
      label: campaignShowFilterLabels[filters.show],
    });
  }

  return chips;
}

/** Remove one chip without discarding the rest of the query. */
export function withoutFilter(
  filters: CampaignFilters,
  key: FilterChip["key"],
): CampaignFilters {
  switch (key) {
    case "query":
      return { ...filters, query: "" };
    case "category":
      return { ...filters, category: "all", subcategory: "all" };
    case "subcategory":
      return { ...filters, subcategory: "all" };
    case "phase":
      return { ...filters, phase: "all" };
    case "country":
      return { ...filters, country: "all", region: "all" };
    case "region":
      return { ...filters, region: "all" };
    case "goal":
      return { ...filters, goal: "all" };
    case "raised":
      return { ...filters, raised: "all" };
    case "percent":
      return { ...filters, percent: "all" };
    case "show":
      return { ...filters, show: "all" };
  }
}

/** Apply a taxonomy selection, clearing a child that no longer belongs. */
export function withCategory(
  filters: CampaignFilters,
  category: CampaignFilters["category"],
): CampaignFilters {
  return { ...filters, category, subcategory: "all" };
}

export function withSubcategory(
  filters: CampaignFilters,
  subcategory: CampaignFilters["subcategory"],
): CampaignFilters {
  if (
    filters.category === "all" ||
    (subcategory !== "all" &&
      !isCampaignSubcategoryOf(filters.category, subcategory))
  ) {
    return { ...filters, subcategory: "all" };
  }

  return { ...filters, subcategory };
}

export const campaignPhaseFilterLabels: Record<CampaignPhaseFilter, string> = {
  all: "Any status",
  funding: "Funding open",
  "live-delivery": "In delivery",
  successful: "Completed",
  unsuccessful: "Missed target",
  paused: "Paused",
};

export const campaignGoalFilterLabels: Record<CampaignGoalFilter, string> = {
  all: "Any goal",
  "under-10k": "Under $10k",
  "10k-25k": "$10k–$25k",
  "25k-50k": "$25k–$50k",
  "50k-plus": "$50k+",
};

export const campaignRaisedFilterLabels: Record<CampaignRaisedFilter, string> =
  {
    all: "Any amount",
    "under-10k": "Under $10k",
    "10k-25k": "$10k–$25k",
    "25k-50k": "$25k–$50k",
    "50k-plus": "$50k+",
    unreported: "Not reported",
  };

export const campaignPercentFilterLabels: Record<
  CampaignPercentFilter,
  string
> = {
  all: "Any progress",
  "under-25": "Under 25%",
  "25-49": "25–49%",
  "50-74": "50–74%",
  "75-99": "75–99%",
  "100-plus": "100%+",
  unreported: "Not reported",
};

export const campaignShowFilterLabels: Record<CampaignShowFilter, string> = {
  all: "All campaigns",
  loved: "Projects We Love",
  saved: "Saved projects",
  open: "Open to backers",
};

/**
 * Countries represented in the current pool, with real counts.
 *
 * A location whose final segment is not a recognised country is grouped under
 * `unknown` ("Other locations") rather than being dropped or guessed into a
 * country. The list is derived from the data, so adding a campaign in Ghana,
 * Kenya, or Germany needs no code change and no hand-maintained country list.
 */
export function campaignCountryCounts(
  campaigns: readonly Campaign[],
): readonly { code: string; count: number; name: string }[] {
  const counts = new Map<string, number>();

  for (const campaign of campaigns) {
    if (!isPublicPhase(campaign.phase)) continue;
    const code = campaignCountryCode(campaign.location) ?? "unknown";
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([code, count]) => ({
      code,
      count,
      name: campaignCountryLabel(code),
    }))
    .sort((a, b) => {
      if (a.code === "unknown") return 1;
      if (b.code === "unknown") return -1;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Regions inside one country, keyed by the exact campaign location string.
 *
 * Only locations with a sub-country segment are offered, so a country-only
 * location does not create a fake region called "Nigeria". The value is the
 * stored location, which is what `matchesRegion` compares.
 */
export function campaignRegionCounts(
  campaigns: readonly Campaign[],
  country: string,
): readonly { count: number; label: string; value: string }[] {
  if (country === "all") return [];

  const counts = new Map<string, number>();

  for (const campaign of campaigns) {
    if (!isPublicPhase(campaign.phase)) continue;
    if ((campaignCountryCode(campaign.location) ?? "unknown") !== country) {
      continue;
    }

    const segments = campaign.location
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean);
    if (segments.length < 2) continue;

    counts.set(campaign.location, (counts.get(campaign.location) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({
      count,
      label: campaignRegionLabel(value),
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function countMoneyRanges(
  campaigns: readonly Campaign[],
  amount: (campaign: Campaign) => MoneyAmount | null,
): Readonly<Record<CampaignMoneyRange, number>> {
  const counts: Record<CampaignMoneyRange, number> = {
    "under-10k": 0,
    "10k-25k": 0,
    "25k-50k": 0,
    "50k-plus": 0,
  };

  for (const campaign of campaigns) {
    if (!isPublicPhase(campaign.phase)) continue;
    const value = amount(campaign);
    if (value === null) continue;

    for (const range of CAMPAIGN_MONEY_RANGES) {
      if (moneyRangeMatches(value, range)) {
        counts[range] += 1;
        break;
      }
    }
  }

  return counts;
}

/** Counts per goal band, from the public campaigns the surface can show. */
export function campaignGoalCounts(
  campaigns: readonly Campaign[],
): Readonly<Record<CampaignGoalFilter, number>> {
  const counts: Record<CampaignGoalFilter, number> = {
    ...countMoneyRanges(campaigns, (campaign) => campaign.funding.target),
    all: 0,
  };

  for (const campaign of campaigns) {
    if (isPublicPhase(campaign.phase)) counts.all += 1;
  }

  return counts;
}

/** Counts per raised band, including the honest "not reported" bucket. */
export function campaignRaisedCounts(
  campaigns: readonly Campaign[],
): Readonly<Record<CampaignRaisedFilter, number>> {
  const counts: Record<CampaignRaisedFilter, number> = {
    ...countMoneyRanges(campaigns, (campaign) => campaign.funding.raised),
    all: 0,
    unreported: 0,
  };

  for (const campaign of campaigns) {
    if (!isPublicPhase(campaign.phase)) continue;
    counts.all += 1;
    if (campaign.funding.raised === null) counts.unreported += 1;
  }

  return counts;
}

/** Counts per percent-raised band, including the honest "not reported" bucket. */
export function campaignPercentCounts(
  campaigns: readonly Campaign[],
): Readonly<Record<CampaignPercentFilter, number>> {
  const counts: Record<CampaignPercentFilter, number> = {
    "100-plus": 0,
    "25-49": 0,
    "50-74": 0,
    "75-99": 0,
    all: 0,
    "under-25": 0,
    unreported: 0,
  };

  for (const campaign of campaigns) {
    if (!isPublicPhase(campaign.phase)) continue;
    counts.all += 1;

    const funded = fundedPercent(
      campaign.funding.raised,
      campaign.funding.target,
    );
    if (funded === null) {
      counts.unreported += 1;
      continue;
    }

    if (funded < 25) counts["under-25"] += 1;
    else if (funded < 50) counts["25-49"] += 1;
    else if (funded < 75) counts["50-74"] += 1;
    else if (funded < 100) counts["75-99"] += 1;
    else counts["100-plus"] += 1;
  }

  return counts;
}

export function subcategoriesForCategory(
  category: CampaignFilters["category"],
) {
  return category === "all"
    ? []
    : (findCampaignCategory(category)?.subcategories ?? []);
}

/** True when a campaign's taxonomy matches an active category/subcategory pair. */
export function matchesTaxonomy(
  taxonomy: CampaignTaxonomy | null,
  category: CampaignFilters["category"],
  subcategory: CampaignFilters["subcategory"],
): boolean {
  if (category === "all") return true;
  if (taxonomy?.category !== category) return false;
  return subcategory === "all" || taxonomy.subcategory === subcategory;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whole days between `now` and `iso`, floored. Negative once the deadline has
 * passed, so a caller can distinguish "1 day left" from "closed".
 */
export function daysUntil(iso: string, now: Date): number {
  return Math.floor((new Date(iso).getTime() - now.getTime()) / DAY_MS);
}

export function daysLeftLabel(iso: string, now: Date): string {
  const days = daysUntil(iso, now);

  if (days < 0) return "Funding closed";
  if (days === 0) return "Last day";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
