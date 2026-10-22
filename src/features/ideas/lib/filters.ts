import type { IdeaFilters } from "@/features/ideas/lib/filter-ideas";
import {
  findIdeaSubcategory,
  ideaCategories,
  ideaCategoryLabel,
  isIdeaCategorySlug,
  isIdeaSubcategoryOf,
  type IdeaCategorySlug,
  type IdeaSubcategorySlug,
} from "@/features/ideas/lib/taxonomy";
import type {
  DiscoveryIdea,
  IdeaRegion,
  IdeaSort,
  IdeaValidationStage,
} from "@/features/ideas/types";

export const IDEA_PAGE_SIZE = 9;

export type IdeaResultView = "grid" | "list";

export type IdeaFilterState = IdeaFilters & {
  page: number;
  view: IdeaResultView;
};

export const defaultIdeaFilters: IdeaFilterState = {
  category: "all",
  page: 1,
  query: "",
  region: "all",
  sort: "most-validated",
  stage: "all",
  subcategory: "all",
  view: "grid",
};

const regions = ["all", "nigeria", "ghana", "senegal"] as const;
const stages = ["all", "early", "growing", "near"] as const;
const sorts = ["most-validated", "most-supported", "newest"] as const;
const views = ["grid", "list"] as const;

type RawParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<Value extends string>(
  value: string,
  options: readonly Value[],
): value is Value {
  return (options as readonly string[]).includes(value);
}

/**
 * Read filters from a URL without trusting it.
 *
 * Unknown values fall back to the default rather than throwing or producing an
 * empty result the reader cannot explain. Quantities are bounded so a crafted
 * link cannot ask for page 10,000 of a fifteen-item catalogue.
 */
export function parseIdeaFilters(params: RawParams): IdeaFilterState {
  const categoryValue = firstValue(params.category) ?? "all";
  const category = isIdeaCategorySlug(categoryValue) ? categoryValue : "all";
  const subcategoryValue = firstValue(params.subcategory) ?? "all";
  const subcategory =
    category !== "all" &&
    subcategoryValue !== "all" &&
    isIdeaSubcategoryOf(category, subcategoryValue)
      ? (subcategoryValue as IdeaSubcategorySlug)
      : "all";
  const regionValue = firstValue(params.region) ?? "all";
  const stageValue = firstValue(params.stage) ?? "all";
  const sortValue = firstValue(params.sort) ?? defaultIdeaFilters.sort;
  const viewValue = firstValue(params.view) ?? defaultIdeaFilters.view;
  const pageValue = Number.parseInt(firstValue(params.page) ?? "1", 10);

  return {
    category,
    page:
      Number.isFinite(pageValue) && pageValue > 0
        ? Math.min(pageValue, 500)
        : 1,
    query: (firstValue(params.q) ?? "").trim().slice(0, 120),
    region: isOneOf(regionValue, regions) ? regionValue : "all",
    sort: isOneOf(sortValue, sorts) ? sortValue : defaultIdeaFilters.sort,
    stage: isOneOf(stageValue, stages) ? stageValue : "all",
    subcategory,
    view: isOneOf(viewValue, views) ? viewValue : defaultIdeaFilters.view,
  };
}

export function ideaFiltersFromSearch(search: string): IdeaFilterState {
  const params = new URLSearchParams(search);
  const entries: RawParams = {};

  for (const key of [
    "category",
    "page",
    "q",
    "region",
    "sort",
    "stage",
    "subcategory",
    "view",
  ] as const) {
    const value = params.get(key);
    if (value !== null) entries[key] = value;
  }

  return parseIdeaFilters(entries);
}

/** A shareable query string, omitting every default so clean URLs stay clean. */
export function ideaFiltersToQuery(state: IdeaFilterState): string {
  const params = new URLSearchParams();
  const query = state.query.trim();

  if (query) params.set("q", query);
  if (state.category !== "all") params.set("category", state.category);
  if (state.category !== "all" && state.subcategory !== "all") {
    params.set("subcategory", state.subcategory);
  }
  if (state.region !== "all") params.set("region", state.region);
  if (state.stage !== "all") params.set("stage", state.stage);
  if (state.sort !== defaultIdeaFilters.sort) params.set("sort", state.sort);
  if (state.view !== defaultIdeaFilters.view) params.set("view", state.view);
  if (state.page > 1) params.set("page", String(state.page));

  const serialised = params.toString();
  return serialised ? `?${serialised}` : "";
}

export type IdeaSortTab = "all" | "supported" | "near" | "newest";

export const sortTabs: readonly { key: IdeaSortTab; label: string }[] = [
  { key: "all", label: "All ideas" },
  { key: "supported", label: "Most supported" },
  { key: "near", label: "Near validation" },
  { key: "newest", label: "Newest" },
];

export function activeSortTab(state: IdeaFilterState): IdeaSortTab {
  if (state.stage === "near") return "near";
  if (state.sort === "most-supported") return "supported";
  if (state.sort === "newest") return "newest";
  return "all";
}

export function filtersForSortTab(
  state: IdeaFilterState,
  tab: IdeaSortTab,
): IdeaFilterState {
  switch (tab) {
    case "supported":
      return {
        ...state,
        page: 1,
        sort: "most-supported",
        stage: "all",
      };
    case "near":
      return { ...state, page: 1, sort: "most-validated", stage: "near" };
    case "newest":
      return { ...state, page: 1, sort: "newest", stage: "all" };
    case "all":
    default:
      return { ...state, page: 1, sort: "most-validated", stage: "all" };
  }
}

export type ActiveFilterChip = {
  key: "category" | "query" | "region" | "stage" | "subcategory";
  label: string;
};

const regionLabels: Record<Exclude<IdeaRegion, never>, string> = {
  ghana: "Ghana",
  nigeria: "Nigeria",
  senegal: "Senegal",
};

const stageLabels: Record<IdeaValidationStage, string> = {
  early: "Early signal",
  growing: "Growing support",
  near: "Near validation",
};

export function activeFilterChips(state: IdeaFilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (state.query.trim()) {
    chips.push({ key: "query", label: `Search: ${state.query.trim()}` });
  }
  if (state.category !== "all") {
    chips.push({
      key: "category",
      label: ideaCategoryLabel(state.category),
    });
  }
  if (state.category !== "all" && state.subcategory !== "all") {
    const subcategory = findIdeaSubcategory(state.category, state.subcategory);
    if (subcategory) {
      chips.push({ key: "subcategory", label: subcategory.label });
    }
  }
  if (state.stage !== "all") {
    chips.push({ key: "stage", label: stageLabels[state.stage] });
  }
  if (state.region !== "all") {
    chips.push({ key: "region", label: regionLabels[state.region] });
  }

  return chips;
}

export function countIdeasByCategory<
  Idea extends { taxonomyCategory?: IdeaCategorySlug | undefined },
>(ideas: readonly Idea[]): Record<IdeaCategorySlug | "all", number> {
  const counts = Object.fromEntries([
    ["all", ideas.length],
    ...ideaCategories.map((category) => [category.slug, 0]),
  ]) as Record<IdeaCategorySlug | "all", number>;

  for (const idea of ideas) {
    if (idea.taxonomyCategory) {
      counts[idea.taxonomyCategory] += 1;
    }
  }

  return counts;
}

/**
 * Subcategory counts grouped by parent category.
 *
 * An idea without a child is counted in `countIdeasByCategory` but not
 * attributed to a child it does not have. A mismatched pair is skipped rather
 * than counted under a parent it does not belong to. The map is built from the
 * public set the surface can show.
 */
export function ideaSubcategoryCountsByCategory<
  Idea extends {
    taxonomyCategory?: IdeaCategorySlug | undefined;
    taxonomySubcategory?: IdeaSubcategorySlug | undefined;
  },
>(
  ideas: readonly Idea[],
): Readonly<Record<string, Readonly<Record<string, number>>>> {
  const counts: Record<string, Record<string, number>> = {};

  for (const idea of ideas) {
    const category = idea.taxonomyCategory;
    const subcategory = idea.taxonomySubcategory;
    if (
      !category ||
      !subcategory ||
      !isIdeaSubcategoryOf(category, subcategory)
    ) {
      continue;
    }

    const categoryCounts = counts[category] ?? {};
    categoryCounts[subcategory] = (categoryCounts[subcategory] ?? 0) + 1;
    counts[category] = categoryCounts;
  }

  return counts;
}

/** A shareable idea-discovery link for an idea's taxonomy pair, or null. */
export function ideaTaxonomyHref(
  idea: Pick<DiscoveryIdea, "taxonomyCategory" | "taxonomySubcategory">,
): string | null {
  if (!idea.taxonomyCategory) return null;

  const params = new URLSearchParams({ category: idea.taxonomyCategory });
  if (idea.taxonomySubcategory) {
    params.set("subcategory", idea.taxonomySubcategory);
  }

  return `/ideas?${params.toString()}`;
}

export function countIdeasByRegion<Idea extends { region: IdeaRegion }>(
  ideas: readonly Idea[],
): Record<IdeaRegion | "all", number> {
  return {
    all: ideas.length,
    ghana: ideas.filter((idea) => idea.region === "ghana").length,
    nigeria: ideas.filter((idea) => idea.region === "nigeria").length,
    senegal: ideas.filter((idea) => idea.region === "senegal").length,
  };
}

export type { IdeaSort };
