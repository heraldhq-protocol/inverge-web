import { describe, expect, it } from "vitest";

import {
  campaignCategories,
  campaignCategoryLabel,
  campaignCategoryPath,
  campaignCategoryRoutes,
  campaignSubcategoryLabel,
  findCampaignCategory,
  findCampaignSubcategory,
  isCampaignCategorySlug,
  isCampaignSubcategoryOf,
} from "@/features/campaigns/lib/taxonomy";

const expectedTaxonomy: Record<string, readonly string[]> = {
  Art: [
    "Ceramics",
    "Conceptual Art",
    "Digital Art",
    "Illustration",
    "Installations",
    "Mixed Media",
    "Painting",
    "Performance Art",
    "Public Art",
    "Sculpture",
    "Social Practice",
    "Textiles",
    "Video Art",
  ],
  Comics: [
    "Anthologies",
    "Comic Books",
    "Events",
    "Graphic Novels",
    "Webcomics",
  ],
  Crafts: [
    "Candles",
    "Crochet",
    "DIY",
    "Embroidery",
    "Glass",
    "Knitting",
    "Pottery",
    "Printing",
    "Quilts",
    "Stationery",
    "Weaving",
    "Woodworking",
  ],
  Dance: ["Performances", "Spaces", "Workshops"],
  Design: [
    "Architecture",
    "Civic Design",
    "Graphic Design",
    "Interactive Design",
    "Product Design",
    "Toys",
    "Typography",
  ],
  Fashion: [
    "Accessories",
    "Apparel",
    "Childrenswear",
    "Couture",
    "Footwear",
    "Jewelry",
    "Pet Fashion",
    "Ready-to-wear",
  ],
  Film: [
    "Action",
    "Animation",
    "Comedy",
    "Documentary",
    "Drama",
    "Experimental",
    "Family",
    "Fantasy",
    "Festivals",
    "Horror",
    "Movie Theaters",
    "Music Videos",
    "Narrative Film",
    "Romance",
    "Science Fiction",
    "Shorts",
    "Television",
    "Thrillers",
    "Webseries",
  ],
  Food: [
    "Community Gardens",
    "Cookbooks",
    "Drinks",
    "Events",
    "Farmer's Markets",
    "Farms",
    "Food Trucks",
    "Restaurants",
    "Small Batch",
    "Spaces",
    "Vegan",
  ],
  Games: [
    "Gaming Hardware",
    "Live Games",
    "Mobile Games",
    "Playing Cards",
    "Puzzles",
    "STL",
    "Tabletop Games",
    "TTRPG",
    "Video Games",
  ],
  Journalism: ["Audio", "Photo", "Print", "Video", "Web"],
  Music: [
    "Blues",
    "Classical Music",
    "Comedy",
    "Country & Folk",
    "Electronic Music",
    "Faith",
    "Hip-Hop",
    "Indie Rock",
    "Jazz",
    "Kids",
    "Latin",
    "Metal",
    "Pop",
    "Punk",
    "R&B",
    "Rock",
    "World Music",
  ],
  Photography: ["Animals", "Fine Art", "Nature", "People", "Photobooks"],
  Publishing: [
    "Academic",
    "Anthologies",
    "Art Books",
    "Audiobooks",
    "Calendars",
    "Children's Books",
    "Comedy",
    "Fiction",
    "Letterpress",
    "Literary Journals",
    "Literary Spaces",
    "Nonfiction",
    "Periodicals",
    "Poetry",
    "Radio & Podcasts",
    "Translations",
    "Young Adult",
    "Zines",
  ],
  Technology: [
    "3D Printing",
    "Apps",
    "Camera Equipment",
    "DIY Electronics",
    "Fabrication Tools",
    "Flight",
    "Gadgets",
    "Hardware",
    "Makerspaces",
    "Robots",
    "Software",
    "Sound",
    "Space Exploration",
    "Wearables",
    "Web",
  ],
  Theater: [
    "Comedy",
    "Experimental",
    "Festivals",
    "Immersive",
    "Musical",
    "Plays",
    "Spaces",
  ],
};

describe("campaign taxonomy", () => {
  it("has the fifteen supplied parents in order", () => {
    expect(campaignCategories.map((category) => category.label)).toEqual(
      Object.keys(expectedTaxonomy),
    );
  });

  it("preserves every supplied subcategory label exactly", () => {
    expect(
      Object.fromEntries(
        campaignCategories.map((category) => [
          category.label,
          category.subcategories.map((subcategory) => subcategory.label),
        ]),
      ),
    ).toEqual(expectedTaxonomy);
  });

  it("keeps the labels whose casing or spelling is easy to normalise away", () => {
    expect(campaignSubcategoryLabel("games", "stl")).toBe("STL");
    expect(campaignSubcategoryLabel("games", "ttrpg")).toBe("TTRPG");
    expect(campaignSubcategoryLabel("fashion", "ready-to-wear")).toBe(
      "Ready-to-wear",
    );
    expect(campaignSubcategoryLabel("food", "farmers-markets")).toBe(
      "Farmer's Markets",
    );
    expect(campaignSubcategoryLabel("film", "movie-theaters")).toBe(
      "Movie Theaters",
    );
  });

  it("gives every parent a stable slug and path", () => {
    expect(campaignCategoryLabel("technology")).toBe("Technology");
    expect(campaignCategoryPath("technology")).toBe(
      "/campaigns/categories/technology",
    );
    expect(campaignCategoryPath("food", "farmers-markets")).toBe(
      "/campaigns/categories/food/farmers-markets",
    );
    expect(campaignCategoryPath("games", "ttrpg")).toBe(
      "/campaigns/categories/games/ttrpg",
    );
  });

  it("rejects an unknown parent and an unknown child", () => {
    expect(isCampaignCategorySlug("health")).toBe(false);
    expect(findCampaignCategory("health")).toBeNull();
    expect(findCampaignSubcategory("food", "not-a-real-child")).toBeNull();
    expect(isCampaignSubcategoryOf("food", "ttrpg")).toBe(false);
  });

  it("has no duplicate parent slugs, child ids, or child labels within a parent", () => {
    const parentSlugs = new Set<string>();
    const childIds = new Set<string>();

    for (const category of campaignCategories) {
      expect(parentSlugs.has(category.slug)).toBe(false);
      parentSlugs.add(category.slug);

      const labels = new Set<string>();
      for (const subcategory of category.subcategories) {
        expect(labels.has(subcategory.label)).toBe(false);
        expect(childIds.has(subcategory.id)).toBe(false);
        labels.add(subcategory.label);
        childIds.add(subcategory.id);
      }
    }
  });

  it("emits one route per parent and every child", () => {
    const parents = campaignCategoryRoutes.filter(
      (route) => route.subcategorySlug === null,
    );
    const children = campaignCategoryRoutes.filter(
      (route) => route.subcategorySlug !== null,
    );

    expect(parents).toHaveLength(15);
    expect(children).toHaveLength(154);
    expect(campaignCategoryRoutes).toHaveLength(169);
  });
});
