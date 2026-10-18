import { fundedPercent } from "@/features/campaigns/lib/amounts";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import {
  isCampaignPhaseFilter,
  isCampaignSort,
  isCampaignView,
  type Campaign,
  type CampaignFilters,
  type CampaignPhaseFilter,
} from "@/features/campaigns/types";
import {
  discoveryCategories,
  isDiscoveryCategory,
  type DiscoveryCategory,
} from "@/features/home/discovery-categories";

/** The human label for a category value. Falls back to the raw value. */
export function categoryLabel(value: DiscoveryCategory): string {
  return (
    discoveryCategories.find((category) => category.value === value)?.label ??
    value
  );
}

export const campaignPhaseFilterLabels: Record<CampaignPhaseFilter, string> = {
  all: "Any status",
  funding: "Funding open",
  "live-delivery": "In delivery",
  successful: "Fully delivered",
  unsuccessful: "Missed target",
};

/**
 * Campaign discovery state.
 *
 * The filter state is the single source of truth for search, category, phase,
 * sort, and view, and it round-trips through the query string so a filtered
 * discovery page is shareable and works without JavaScript. A category slug from
 * a route overrides the query-string category, because the route is the more
 * specific statement of intent.
 */

export const defaultCampaignFilters: CampaignFilters = {
  category: "all",
  phase: "all",
  query: "",
  sort: "ending-soon",
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
  const category = firstValue(params.category);

  return {
    category: isDiscoveryCategory(category) ? category : "all",
    phase: isCampaignPhaseFilter(phase) ? phase : "all",
    query,
    sort: isCampaignSort(sort) ? sort : defaultCampaignFilters.sort,
    view: isCampaignView(view) ? view : defaultCampaignFilters.view,
  };
}

/** Serialise non-default values only, so an unfiltered page has a clean URL. */
export function campaignFilterQuery(filters: CampaignFilters): string {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.phase !== "all") params.set("phase", filters.phase);
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
    filters.phase !== "all"
  );
}

function haystack(campaign: Campaign): string {
  return [
    campaign.title,
    campaign.summary,
    campaign.creator.name,
    campaign.location,
    campaign.category,
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
      return campaign.phase === "funding" || campaign.phase === "paused";
    case "live-delivery":
      return campaign.phase === "delivering";
    case "successful":
      return campaign.phase === "completed";
    case "unsuccessful":
      return campaign.phase === "funding-failed";
  }
}

/**
 * Sort key. `unknown` campaigns and campaigns without a raised total go last in
 * "most funded" rather than being ranked as zero.
 */
function compare(a: Campaign, b: Campaign, sort: CampaignFilters["sort"]) {
  switch (sort) {
    case "ending-soon": {
      const aLive = a.phase === "funding" ? 0 : 1;
      const bLive = b.phase === "funding" ? 0 : 1;
      if (aLive !== bLive) return aLive - bLive;
      return a.funding.closesAt.localeCompare(b.funding.closesAt);
    }
    case "most-funded": {
      const aPercent = fundedPercent(a.funding.raised, a.funding.target);
      const bPercent = fundedPercent(b.funding.raised, b.funding.target);
      if (aPercent === null && bPercent === null) return 0;
      if (aPercent === null) return 1;
      if (bPercent === null) return -1;
      return bPercent - aPercent;
    }
    case "newest": {
      return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
    }
    case "recently-updated": {
      const latest = (campaign: Campaign) =>
        campaign.updates.reduce(
          (most, update) => (update.createdAt > most ? update.createdAt : most),
          campaign.publishedAt ?? "",
        );
      return latest(b).localeCompare(latest(a));
    }
  }
}

export function filterCampaigns(
  campaigns: readonly Campaign[],
  filters: CampaignFilters,
): readonly Campaign[] {
  return campaigns
    .filter(
      (campaign) =>
        isPublicPhase(campaign.phase) &&
        phaseMatches(campaign, filters) &&
        (filters.category === "all" ||
          campaign.category === filters.category) &&
        matchesQuery(campaign, filters.query),
    )
    .sort((a, b) => compare(a, b, filters.sort));
}

/** Result counts per category, for the filter row. Counts include only public phases. */
export function campaignCategoryCounts(
  campaigns: readonly Campaign[],
): Readonly<Record<string, number>> {
  return campaigns
    .filter((campaign) => isPublicPhase(campaign.phase))
    .reduce<Record<string, number>>((counts, campaign) => {
      counts[campaign.category] = (counts[campaign.category] ?? 0) + 1;
      return counts;
    }, {});
}

export type FilterChip = { key: keyof CampaignFilters; label: string };

/** The chips a backer can remove, in the order the controls appear. */
export function activeFilterChips(filters: CampaignFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.query) chips.push({ key: "query", label: `“${filters.query}”` });
  if (filters.category !== "all") {
    chips.push({ key: "category", label: categoryLabel(filters.category) });
  }
  if (filters.phase !== "all") {
    chips.push({
      key: "phase",
      label: campaignPhaseFilterLabels[filters.phase],
    });
  }

  return chips;
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
