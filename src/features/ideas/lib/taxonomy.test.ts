import { describe, expect, it } from "vitest";

import { campaignCategories } from "@/features/campaigns/lib/taxonomy";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import {
  findIdeaSubcategory,
  ideaCategories,
  ideaCategoryLabel,
  ideaSubcategoryLabel,
  isIdeaCategorySlug,
  isIdeaSubcategoryOf,
  subcategoriesForIdeaCategory,
} from "@/features/ideas/lib/taxonomy";

describe("idea taxonomy", () => {
  it("is the campaign taxonomy rather than a copy", () => {
    expect(ideaCategories).toBe(campaignCategories);
  });

  it("lists the same parents and children as campaign discovery", () => {
    expect(ideaCategories.map((category) => category.slug)).toEqual(
      campaignCategories.map((category) => category.slug),
    );

    for (const category of campaignCategories) {
      expect(
        subcategoriesForIdeaCategory(category.slug).map(
          (subcategory) => subcategory.slug,
        ),
      ).toEqual(category.subcategories.map((subcategory) => subcategory.slug));
    }
  });

  it("resolves a child only under its own parent", () => {
    expect(findIdeaSubcategory("food", "farms")).toMatchObject({
      category: "food",
      label: "Farms",
      slug: "farms",
    });
    expect(findIdeaSubcategory("technology", "farms")).toBeNull();
    expect(isIdeaSubcategoryOf("technology", "apps")).toBe(true);
    expect(isIdeaSubcategoryOf("food", "apps")).toBe(false);
  });

  it("accepts campaign category slugs and rejects the legacy buckets", () => {
    expect(isIdeaCategorySlug("technology")).toBe(true);
    expect(isIdeaCategorySlug("art")).toBe(true);
    expect(isIdeaCategorySlug("agriculture")).toBe(false);
    expect(ideaCategoryLabel("food")).toBe("Food");
    expect(ideaSubcategoryLabel("food", "farmers-markets")).toBe(
      "Farmer's Markets",
    );
  });

  it("assigns every public preview idea a valid campaign pair", () => {
    for (const idea of [
      ...ideasPreviewData.featured,
      ...ideasPreviewData.ideas,
    ]) {
      if (!idea.taxonomyCategory || !idea.taxonomySubcategory) {
        throw new Error(`Preview idea ${idea.id} has no taxonomy pair`);
      }

      expect(
        isIdeaSubcategoryOf(idea.taxonomyCategory, idea.taxonomySubcategory),
      ).toBe(true);
    }
  });
});
