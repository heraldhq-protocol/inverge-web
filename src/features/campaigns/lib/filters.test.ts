import { describe, expect, it } from "vitest";

import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  activeFilterChips,
  campaignCategoryCounts,
  campaignCountryCode,
  campaignCountryCounts,
  campaignCountryLabel,
  campaignFilterQuery,
  campaignRegionCounts,
  campaignRegionLabel,
  campaignSubcategoryCounts,
  campaignSubcategoryCountsByCategory,
  defaultCampaignFilters,
  filterCampaigns,
  hasActiveFilters,
  matchesQuery,
  parseCampaignFilters,
  withCategory,
  withSubcategory,
  withoutFilter,
  type FilterChip,
} from "@/features/campaigns/lib/filters";
import {
  findCampaignCategory,
  findCampaignSubcategory,
} from "@/features/campaigns/lib/taxonomy";
import type { Campaign, CampaignFilters } from "@/features/campaigns/types";

function filters(patch: Partial<CampaignFilters> = {}): CampaignFilters {
  return { ...defaultCampaignFilters, ...patch };
}

function slugs(campaigns: readonly Campaign[]): string[] {
  return campaigns.map((campaign) => campaign.slug);
}

describe("campaign filter parsing and serialising", () => {
  it("parses a full shareable query", () => {
    expect(
      parseCampaignFilters({
        category: "technology",
        country: "NG",
        phase: "funding",
        q: "  solar  ",
        region: "Lagos State, Nigeria",
        sort: "newest",
        subcategory: "hardware",
        view: "list",
      }),
    ).toEqual({
      category: "technology",
      country: "NG",
      goal: "all",
      percent: "all",
      phase: "funding",
      query: "solar",
      raised: "all",
      region: "Lagos State, Nigeria",
      show: "all",
      sort: "newest",
      subcategory: "hardware",
      view: "list",
    });
  });

  it("accepts a legacy location value as a country and region", () => {
    expect(
      parseCampaignFilters({ location: "Lagos State, Nigeria" }),
    ).toMatchObject({
      country: "NG",
      region: "Lagos State, Nigeria",
    });
  });

  it("accepts a country name from the shared country list", () => {
    expect(parseCampaignFilters({ country: "Ghana" })).toMatchObject({
      country: "GH",
      region: "all",
    });
  });

  it("drops a region that belongs to a different country", () => {
    expect(
      parseCampaignFilters({
        country: "GH",
        region: "Lagos State, Nigeria",
      }),
    ).toMatchObject({ country: "GH", region: "all" });
  });

  it("drops an orphan region when no country is selected", () => {
    expect(
      parseCampaignFilters({ region: "Lagos State, Nigeria" }),
    ).toMatchObject({ country: "all", region: "all" });
  });

  it("drops an unknown parent rather than trusting the URL", () => {
    expect(
      parseCampaignFilters({ category: "health", subcategory: "clinics" }),
    ).toMatchObject({ category: "all", subcategory: "all" });
  });

  it("drops a subcategory that does not belong to the parent", () => {
    expect(
      parseCampaignFilters({ category: "food", subcategory: "hardware" }),
    ).toMatchObject({ category: "food", subcategory: "all" });
  });

  it("drops an orphan subcategory when no parent is selected", () => {
    expect(parseCampaignFilters({ subcategory: "hardware" })).toMatchObject({
      category: "all",
      subcategory: "all",
    });
  });

  it("falls back on unknown sort, phase, and view values", () => {
    expect(
      parseCampaignFilters({
        phase: "invented",
        sort: "popularity",
        view: "masonry",
      }),
    ).toMatchObject({
      phase: "all",
      sort: "ending-soon",
      view: "grid",
    });
  });

  it("serialises only non-default state", () => {
    expect(campaignFilterQuery(defaultCampaignFilters)).toBe("");
    expect(
      campaignFilterQuery(
        filters({
          category: "technology",
          country: "NG",
          phase: "funding",
          query: "solar",
          region: "Lagos State, Nigeria",
          sort: "newest",
          subcategory: "hardware",
          view: "list",
        }),
      ),
    ).toBe(
      "q=solar&category=technology&subcategory=hardware&phase=funding&country=NG&region=Lagos+State%2C+Nigeria&sort=newest&view=list",
    );
  });

  it("round-trips every field without losing a selection", () => {
    const selected = filters({
      category: "games",
      country: "GH",
      phase: "successful",
      query: "zine",
      region: "Greater Accra, Ghana",
      sort: "recently-updated",
      subcategory: "ttrpg",
      view: "list",
    });
    const parsed = parseCampaignFilters(
      Object.fromEntries(new URLSearchParams(campaignFilterQuery(selected))),
    );

    expect(parsed).toEqual(selected);
  });
});

describe("campaign filtering", () => {
  it("filters to a parent category and includes every child", () => {
    const result = filterCampaigns(
      previewCampaigns,
      filters({ category: "technology" }),
    );

    expect(slugs(result).sort()).toEqual([
      "campus-konekt",
      "farmlink-coldbox",
      "studymate-ng",
      "sungrid-community-power",
    ]);
  });

  it("filters to one subcategory without including siblings", () => {
    const result = filterCampaigns(
      previewCampaigns,
      filters({ category: "technology", subcategory: "hardware" }),
    );

    expect(slugs(result).sort()).toEqual([
      "farmlink-coldbox",
      "sungrid-community-power",
    ]);
  });

  it("never attributes an unassigned campaign to a category it lacks", () => {
    const technology = filterCampaigns(
      previewCampaigns,
      filters({ category: "technology" }),
    );

    expect(slugs(technology)).not.toContain("healthreach-clinic");
    expect(
      filterCampaigns(previewCampaigns, filters({ category: "all" }))
        .map((campaign) => campaign.slug)
        .sort(),
    ).toContain("healthreach-clinic");
  });

  it("searches titles, creators, places, and taxonomy labels", () => {
    expect(matchesQuery(previewCampaigns[0]!, "sungrid")).toBe(true);
    expect(matchesQuery(previewCampaigns[0]!, "ogun")).toBe(true);
    expect(matchesQuery(previewCampaigns[0]!, "greenflow")).toBe(true);
    expect(
      matchesQuery(
        previewCampaigns.find(
          (campaign) => campaign.slug === "ibadan-creative-lab",
        )!,
        "mixed media",
      ),
    ).toBe(true);
  });

  it("treats every search term as required", () => {
    expect(matchesQuery(previewCampaigns[0]!, "solar broken")).toBe(false);
  });

  it("filters by country and region without a Nigeria-only list", () => {
    const ghana: Campaign = {
      ...previewCampaigns[0]!,
      id: "accra-solar",
      location: "Greater Accra, Ghana",
      slug: "accra-solar",
    };
    const pool = [...previewCampaigns, ghana];

    expect(slugs(filterCampaigns(pool, filters({ country: "GH" })))).toEqual([
      "accra-solar",
    ]);
    expect(
      slugs(
        filterCampaigns(
          pool,
          filters({ country: "GH", region: "Greater Accra, Ghana" }),
        ),
      ),
    ).toEqual(["accra-solar"]);
    expect(
      filterCampaigns(
        pool,
        filters({ country: "NG", region: "Greater Accra, Ghana" }),
      ),
    ).toHaveLength(0);
    expect(
      filterCampaigns(pool, filters({ country: "NG" })).length,
    ).toBeGreaterThan(0);
  });

  it("derives country and region counts from the pool", () => {
    const ghana: Campaign = {
      ...previewCampaigns[0]!,
      id: "accra-solar",
      location: "Greater Accra, Ghana",
      slug: "accra-solar",
    };
    const pool = [...previewCampaigns, ghana];
    const countries = campaignCountryCounts(pool);

    expect(countries).toEqual(
      expect.arrayContaining([
        { code: "GH", count: 1, name: "Ghana" },
        expect.objectContaining({ code: "NG", name: "Nigeria" }),
      ]),
    );
    expect(campaignRegionCounts(pool, "GH")).toEqual([
      { count: 1, label: "Greater Accra", value: "Greater Accra, Ghana" },
    ]);
    expect(campaignRegionCounts(pool, "NG")).toEqual(
      expect.arrayContaining([
        { count: 1, label: "Ogun State", value: "Ogun State, Nigeria" },
      ]),
    );
    expect(campaignRegionCounts(pool, "all")).toEqual([]);
  });

  it("groups a location with no recognised country honestly", () => {
    const remote: Campaign = {
      ...previewCampaigns[0]!,
      id: "remote-studio",
      location: "Remote",
      slug: "remote-studio",
    };

    expect(campaignCountryCode("Remote")).toBeNull();
    expect(campaignCountryCode("Greater Accra, Ghana")).toBe("GH");
    expect(campaignCountryCode("Lagos State, Nigeria")).toBe("NG");
    expect(campaignCountryLabel("unknown")).toBe("Other locations");
    expect(campaignCountryCounts([remote])).toEqual([
      { code: "unknown", count: 1, name: "Other locations" },
    ]);
    expect(campaignRegionLabel("Ogun State, Nigeria")).toBe("Ogun State");
    expect(campaignRegionLabel("Nigeria")).toBe("Nigeria");
  });

  it("describes paused campaigns as neither funding open nor completed", () => {
    const funding = filterCampaigns(
      previewCampaigns,
      filters({ phase: "funding" }),
    );
    const all = filterCampaigns(previewCampaigns, filters());

    expect(funding.map((campaign) => campaign.slug)).not.toContain(
      "healthreach-clinic",
    );
    expect(all.map((campaign) => campaign.slug)).toContain(
      "healthreach-clinic",
    );
  });

  it("filters completed campaigns without including failed ones", () => {
    const completed = filterCampaigns(
      previewCampaigns,
      filters({ phase: "successful" }),
    );

    expect(slugs(completed)).toEqual(["harmattan-health-kiosks"]);
  });

  it("keeps only public phases in every result", () => {
    const all = filterCampaigns(previewCampaigns, filters());

    expect(all.map((campaign) => campaign.slug)).not.toContain("skill-circle");
    expect(all.map((campaign) => campaign.slug)).not.toContain(
      "naija-craft-marketplace",
    );
  });
});

describe("campaign filter helpers", () => {
  it("clears a child when the parent changes", () => {
    expect(
      withCategory(
        filters({ category: "technology", subcategory: "software" }),
        "food",
      ),
    ).toMatchObject({ category: "food", subcategory: "all" });
  });

  it("refuses a child that does not belong to the selected parent", () => {
    expect(
      withSubcategory(filters({ category: "food" }), "hardware"),
    ).toMatchObject({ category: "food", subcategory: "all" });
  });

  it("builds removable chips in control order and clears the right field", () => {
    const selected = filters({
      category: "technology",
      country: "NG",
      phase: "funding",
      query: "solar",
      region: "Lagos State, Nigeria",
      subcategory: "hardware",
    });
    const chips = activeFilterChips(selected);

    expect(chips.map((chip) => chip.key)).toEqual([
      "query",
      "category",
      "subcategory",
      "phase",
      "country",
      "region",
    ]);
    expect(chips.map((chip) => chip.label)).toContain("Nigeria");
    expect(chips.map((chip) => chip.label)).toContain("Lagos State");
    expect(hasActiveFilters(selected)).toBe(true);

    const withoutCategory = withoutFilter(selected, "category");
    expect(withoutCategory).toMatchObject({
      category: "all",
      phase: "funding",
      query: "solar",
      subcategory: "all",
    });
    expect(activeFilterChips(withoutCategory).map((chip) => chip.key)).toEqual([
      "query",
      "phase",
      "country",
      "region",
    ]);

    const withoutCountry = withoutFilter(selected, "country");
    expect(withoutCountry).toMatchObject({ country: "all", region: "all" });

    const withoutQuery = withoutFilter(selected, "query");
    expect(withoutQuery.query).toBe("");
  });

  it("removes every filter chip key without throwing on an unknown key", () => {
    const selected = filters({
      category: "food",
      country: "NG",
      phase: "successful",
      query: "x",
      region: "Lagos State, Nigeria",
      subcategory: "farms",
    });
    const keys: FilterChip["key"][] = [
      "query",
      "category",
      "subcategory",
      "phase",
      "country",
      "region",
      "goal",
      "raised",
      "percent",
      "show",
    ];

    for (const key of keys) {
      expect(() => withoutFilter(selected, key)).not.toThrow();
    }
  });

  it("counts only public, explicitly assigned campaigns", () => {
    expect(campaignCategoryCounts(previewCampaigns)).toEqual({
      art: 1,
      food: 1,
      technology: 4,
    });
    expect(campaignSubcategoryCounts(previewCampaigns, "technology")).toEqual({
      hardware: 2,
      software: 1,
      web: 1,
    });
    expect(campaignSubcategoryCountsByCategory(previewCampaigns)).toMatchObject(
      {
        art: { "mixed-media": 1 },
        food: { restaurants: 1 },
        technology: { hardware: 2, software: 1, web: 1 },
      },
    );
  });

  it("assigns preview campaigns only to real taxonomy pairs", () => {
    for (const campaign of previewCampaigns) {
      if (!campaign.taxonomy) continue;

      expect(findCampaignCategory(campaign.taxonomy.category)).not.toBeNull();
      if (campaign.taxonomy.subcategory) {
        expect(
          findCampaignSubcategory(
            campaign.taxonomy.category,
            campaign.taxonomy.subcategory,
          ),
        ).not.toBeNull();
      }
    }

    // Health and education have no honest destination in the supplied
    // taxonomy, and the draft was never published. None may be forced into a
    // neighbouring parent to make the counts look complete.
    for (const slug of [
      "healthreach-clinic",
      "harmattan-health-kiosks",
      "skill-circle",
    ]) {
      expect(
        previewCampaigns.find((campaign) => campaign.slug === slug)?.taxonomy,
      ).toBeNull();
    }
  });
});
