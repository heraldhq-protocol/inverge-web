import { describe, expect, it } from "vitest";

import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import {
  activeFilterChips,
  activeSortTab,
  countIdeasByCategory,
  defaultIdeaFilters,
  filtersForSortTab,
  ideaFiltersFromSearch,
  ideaFiltersToQuery,
  parseIdeaFilters,
} from "@/features/ideas/lib/filters";

describe("parseIdeaFilters", () => {
  it("falls back to the defaults for an empty URL", () => {
    expect(parseIdeaFilters({})).toEqual(defaultIdeaFilters);
  });

  it("reads supported values and ignores unknown ones", () => {
    const filters = parseIdeaFilters({
      category: "agriculture",
      page: "3",
      q: "solar",
      region: "ghana",
      sort: "newest",
      stage: "near",
      view: "list",
    });

    expect(filters).toMatchObject({
      category: "agriculture",
      page: 3,
      query: "solar",
      region: "ghana",
      sort: "newest",
      stage: "near",
      view: "list",
    });

    expect(
      parseIdeaFilters({
        category: "not-a-category",
        page: "-4",
        region: "mars",
        sort: "random",
        stage: "later",
        view: "masonry",
      }),
    ).toMatchObject({
      category: "all",
      page: 1,
      region: "all",
      sort: "most-validated",
      stage: "all",
      view: "grid",
    });
  });

  it("bounds a crafted page number", () => {
    expect(parseIdeaFilters({ page: "9000" }).page).toBe(500);
    expect(parseIdeaFilters({ page: "NaN" }).page).toBe(1);
  });
});

describe("ideaFiltersToQuery", () => {
  it("omits defaults so a clean catalogue stays at a clean URL", () => {
    expect(ideaFiltersToQuery(defaultIdeaFilters)).toBe("");
  });

  it("round-trips a non-default state", () => {
    const query = ideaFiltersToQuery({
      category: "technology",
      page: 2,
      query: "campus",
      region: "nigeria",
      sort: "newest",
      stage: "early",
      view: "list",
    });

    expect(ideaFiltersFromSearch(query)).toEqual({
      category: "technology",
      page: 2,
      query: "campus",
      region: "nigeria",
      sort: "newest",
      stage: "early",
      view: "list",
    });
  });
});

describe("sort tabs", () => {
  it("maps a tab to the filter state it stands for", () => {
    expect(filtersForSortTab(defaultIdeaFilters, "supported")).toMatchObject({
      sort: "most-supported",
      stage: "all",
    });
    expect(filtersForSortTab(defaultIdeaFilters, "near")).toMatchObject({
      sort: "most-validated",
      stage: "near",
    });
    expect(activeSortTab(filtersForSortTab(defaultIdeaFilters, "newest"))).toBe(
      "newest",
    );
    expect(activeSortTab(filtersForSortTab(defaultIdeaFilters, "near"))).toBe(
      "near",
    );
  });
});

describe("activeFilterChips", () => {
  it("describes every active constraint in plain language", () => {
    expect(
      activeFilterChips({
        ...defaultIdeaFilters,
        category: "agriculture",
        query: "cold storage",
        region: "nigeria",
        stage: "near",
      }),
    ).toEqual([
      { key: "query", label: "Search: cold storage" },
      { key: "category", label: "Agriculture" },
      { key: "stage", label: "Near validation" },
      { key: "region", label: "Nigeria" },
    ]);
  });
});

describe("countIdeasByCategory", () => {
  it("counts the visible catalogue per category, including all", () => {
    const counts = countIdeasByCategory([
      ...ideasPreviewData.featured,
      ...ideasPreviewData.ideas,
    ]);

    expect(counts.all).toBe(
      ideasPreviewData.featured.length + ideasPreviewData.ideas.length,
    );
    expect(counts.agriculture).toBeGreaterThan(0);
  });
});
