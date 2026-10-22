import { describe, expect, it } from "vitest";

import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import {
  filterAndSortIdeas,
  ideaTaxonomyText,
} from "@/features/ideas/lib/filter-ideas";
import {
  activeFilterChips,
  activeSortTab,
  countIdeasByCategory,
  defaultIdeaFilters,
  filtersForSortTab,
  ideaFiltersFromSearch,
  ideaFiltersToQuery,
  ideaSubcategoryCountsByCategory,
  ideaTaxonomyHref,
  parseIdeaFilters,
} from "@/features/ideas/lib/filters";

describe("parseIdeaFilters", () => {
  it("falls back to the defaults for an empty URL", () => {
    expect(parseIdeaFilters({})).toEqual(defaultIdeaFilters);
  });

  it("reads supported values and ignores unknown ones", () => {
    const filters = parseIdeaFilters({
      category: "food",
      page: "3",
      q: "solar",
      region: "ghana",
      sort: "newest",
      stage: "near",
      subcategory: "farms",
      view: "list",
    });

    expect(filters).toMatchObject({
      category: "food",
      page: 3,
      query: "solar",
      region: "ghana",
      sort: "newest",
      stage: "near",
      subcategory: "farms",
      view: "list",
    });

    expect(
      parseIdeaFilters({
        category: "agriculture",
        page: "-4",
        region: "mars",
        sort: "random",
        stage: "later",
        subcategory: "farms",
        view: "masonry",
      }),
    ).toMatchObject({
      category: "all",
      page: 1,
      region: "all",
      sort: "most-validated",
      stage: "all",
      subcategory: "all",
      view: "grid",
    });
  });

  it("reads a subcategory only when it belongs to the selected category", () => {
    expect(
      parseIdeaFilters({ category: "food", subcategory: "farms" }),
    ).toMatchObject({ category: "food", subcategory: "farms" });

    expect(
      parseIdeaFilters({ category: "food", subcategory: "apps" }),
    ).toMatchObject({ category: "food", subcategory: "all" });

    expect(
      parseIdeaFilters({ category: "all", subcategory: "farms" }),
    ).toMatchObject({ category: "all", subcategory: "all" });
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

  it("round-trips a non-default state, including a subcategory", () => {
    const query = ideaFiltersToQuery({
      category: "technology",
      page: 2,
      query: "campus",
      region: "nigeria",
      sort: "newest",
      stage: "early",
      subcategory: "apps",
      view: "list",
    });

    expect(ideaFiltersFromSearch(query)).toEqual({
      category: "technology",
      page: 2,
      query: "campus",
      region: "nigeria",
      sort: "newest",
      stage: "early",
      subcategory: "apps",
      view: "list",
    });
  });

  it("never serialises a subcategory without its parent", () => {
    expect(
      ideaFiltersToQuery({
        ...defaultIdeaFilters,
        category: "all",
        subcategory: "farms",
      }),
    ).toBe("");
  });
});

describe("taxonomy display", () => {
  it("shows the campaign parent and child together", () => {
    expect(
      ideaTaxonomyText({
        category: "Agriculture",
        taxonomyCategory: "food",
        taxonomySubcategory: "farms",
      }),
    ).toBe("Food / Farms");
    expect(ideaTaxonomyText({ category: "Campus technology" })).toBe(
      "Campus technology",
    );
  });

  it("links to the same taxonomy filter the sidebar uses", () => {
    expect(
      ideaTaxonomyHref({
        taxonomyCategory: "food",
        taxonomySubcategory: "farmers-markets",
      }),
    ).toBe("/ideas?category=food&subcategory=farmers-markets");
    expect(ideaTaxonomyHref({})).toBeNull();
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
        category: "food",
        query: "cold storage",
        region: "nigeria",
        stage: "near",
        subcategory: "farms",
      }),
    ).toEqual([
      { key: "query", label: "Search: cold storage" },
      { key: "category", label: "Food" },
      { key: "subcategory", label: "Farms" },
      { key: "stage", label: "Near validation" },
      { key: "region", label: "Nigeria" },
    ]);
  });
});

describe("countIdeasByCategory", () => {
  it("counts the visible catalogue per campaign category, including all", () => {
    const counts = countIdeasByCategory([
      ...ideasPreviewData.featured,
      ...ideasPreviewData.ideas,
    ]);

    expect(counts.all).toBe(
      ideasPreviewData.featured.length + ideasPreviewData.ideas.length,
    );
    expect(counts.food).toBe(5);
    expect(counts.technology).toBe(8);
    expect(counts.art).toBe(0);
  });
});

describe("subcategory filtering", () => {
  it("returns only the ideas in the selected child", () => {
    const ideas = [...ideasPreviewData.featured, ...ideasPreviewData.ideas];
    const results = filterAndSortIdeas(ideas, {
      ...defaultIdeaFilters,
      category: "food",
      subcategory: "spaces",
    });

    expect(results.map((idea) => idea.id)).toEqual(["kitchen-collective"]);
  });

  it("keeps an idea without a child under its parent and out of every child", () => {
    const idea = ideasPreviewData.ideas.find(
      (candidate) => candidate.id === "kitchen-collective",
    );
    const removedSubcategory = idea?.taxonomySubcategory;
    if (!idea || !removedSubcategory) {
      throw new Error("Expected a preview idea with a subcategory");
    }

    const ideaWithoutSubcategory = { ...idea };
    delete ideaWithoutSubcategory.taxonomySubcategory;

    const ideas = [ideaWithoutSubcategory];
    expect(
      filterAndSortIdeas(ideas, {
        ...defaultIdeaFilters,
        category: "food",
      }),
    ).toHaveLength(1);
    expect(
      filterAndSortIdeas(ideas, {
        ...defaultIdeaFilters,
        category: "food",
        subcategory: removedSubcategory,
      }),
    ).toHaveLength(0);
    expect(countIdeasByCategory(ideas).food).toBe(1);
    expect(ideaSubcategoryCountsByCategory(ideas)).toEqual({});
  });
});

describe("ideaSubcategoryCountsByCategory", () => {
  it("counts each public idea under its parent and child", () => {
    const ideas = [...ideasPreviewData.featured, ...ideasPreviewData.ideas];
    const counts = ideaSubcategoryCountsByCategory(ideas);

    expect(counts.food).toEqual({
      "farmers-markets": 2,
      farms: 2,
      spaces: 1,
    });
    expect(counts.technology).toEqual({
      apps: 3,
      hardware: 3,
      software: 2,
    });
  });
});
