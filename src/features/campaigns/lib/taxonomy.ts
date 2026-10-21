/**
 * The campaign category taxonomy.
 *
 * This is the single source of truth for campaign categories and
 * subcategories. Slugs are written out rather than derived from labels at
 * runtime, so a display-label change can never move a published URL or a saved
 * filter. `assertTaxonomyIsSound` runs at module load and fails the build on a
 * duplicate parent slug, a duplicate subcategory slug within a parent, or a
 * repeated label within a parent.
 *
 * The supplied labels are preserved exactly, including `STL`, `TTRPG`,
 * `Ready-to-wear`, `Farmer's Markets`, and the US spellings in `Theater` and
 * `Movie Theaters`. They are product data, not prose to be normalised to UK
 * spelling.
 */

type TaxonomyDefinition = readonly {
  label: string;
  slug: string;
  subcategories: readonly { label: string; slug: string }[];
}[];

const taxonomyDefinition = [
  {
    label: "Art",
    slug: "art",
    subcategories: [
      { label: "Ceramics", slug: "ceramics" },
      { label: "Conceptual Art", slug: "conceptual-art" },
      { label: "Digital Art", slug: "digital-art" },
      { label: "Illustration", slug: "illustration" },
      { label: "Installations", slug: "installations" },
      { label: "Mixed Media", slug: "mixed-media" },
      { label: "Painting", slug: "painting" },
      { label: "Performance Art", slug: "performance-art" },
      { label: "Public Art", slug: "public-art" },
      { label: "Sculpture", slug: "sculpture" },
      { label: "Social Practice", slug: "social-practice" },
      { label: "Textiles", slug: "textiles" },
      { label: "Video Art", slug: "video-art" },
    ],
  },
  {
    label: "Comics",
    slug: "comics",
    subcategories: [
      { label: "Anthologies", slug: "anthologies" },
      { label: "Comic Books", slug: "comic-books" },
      { label: "Events", slug: "events" },
      { label: "Graphic Novels", slug: "graphic-novels" },
      { label: "Webcomics", slug: "webcomics" },
    ],
  },
  {
    label: "Crafts",
    slug: "crafts",
    subcategories: [
      { label: "Candles", slug: "candles" },
      { label: "Crochet", slug: "crochet" },
      { label: "DIY", slug: "diy" },
      { label: "Embroidery", slug: "embroidery" },
      { label: "Glass", slug: "glass" },
      { label: "Knitting", slug: "knitting" },
      { label: "Pottery", slug: "pottery" },
      { label: "Printing", slug: "printing" },
      { label: "Quilts", slug: "quilts" },
      { label: "Stationery", slug: "stationery" },
      { label: "Weaving", slug: "weaving" },
      { label: "Woodworking", slug: "woodworking" },
    ],
  },
  {
    label: "Dance",
    slug: "dance",
    subcategories: [
      { label: "Performances", slug: "performances" },
      { label: "Spaces", slug: "spaces" },
      { label: "Workshops", slug: "workshops" },
    ],
  },
  {
    label: "Design",
    slug: "design",
    subcategories: [
      { label: "Architecture", slug: "architecture" },
      { label: "Civic Design", slug: "civic-design" },
      { label: "Graphic Design", slug: "graphic-design" },
      { label: "Interactive Design", slug: "interactive-design" },
      { label: "Product Design", slug: "product-design" },
      { label: "Toys", slug: "toys" },
      { label: "Typography", slug: "typography" },
    ],
  },
  {
    label: "Fashion",
    slug: "fashion",
    subcategories: [
      { label: "Accessories", slug: "accessories" },
      { label: "Apparel", slug: "apparel" },
      { label: "Childrenswear", slug: "childrenswear" },
      { label: "Couture", slug: "couture" },
      { label: "Footwear", slug: "footwear" },
      { label: "Jewelry", slug: "jewelry" },
      { label: "Pet Fashion", slug: "pet-fashion" },
      { label: "Ready-to-wear", slug: "ready-to-wear" },
    ],
  },
  {
    label: "Film",
    slug: "film",
    subcategories: [
      { label: "Action", slug: "action" },
      { label: "Animation", slug: "animation" },
      { label: "Comedy", slug: "comedy" },
      { label: "Documentary", slug: "documentary" },
      { label: "Drama", slug: "drama" },
      { label: "Experimental", slug: "experimental" },
      { label: "Family", slug: "family" },
      { label: "Fantasy", slug: "fantasy" },
      { label: "Festivals", slug: "festivals" },
      { label: "Horror", slug: "horror" },
      { label: "Movie Theaters", slug: "movie-theaters" },
      { label: "Music Videos", slug: "music-videos" },
      { label: "Narrative Film", slug: "narrative-film" },
      { label: "Romance", slug: "romance" },
      { label: "Science Fiction", slug: "science-fiction" },
      { label: "Shorts", slug: "shorts" },
      { label: "Television", slug: "television" },
      { label: "Thrillers", slug: "thrillers" },
      { label: "Webseries", slug: "webseries" },
    ],
  },
  {
    label: "Food",
    slug: "food",
    subcategories: [
      { label: "Community Gardens", slug: "community-gardens" },
      { label: "Cookbooks", slug: "cookbooks" },
      { label: "Drinks", slug: "drinks" },
      { label: "Events", slug: "events" },
      { label: "Farmer's Markets", slug: "farmers-markets" },
      { label: "Farms", slug: "farms" },
      { label: "Food Trucks", slug: "food-trucks" },
      { label: "Restaurants", slug: "restaurants" },
      { label: "Small Batch", slug: "small-batch" },
      { label: "Spaces", slug: "spaces" },
      { label: "Vegan", slug: "vegan" },
    ],
  },
  {
    label: "Games",
    slug: "games",
    subcategories: [
      { label: "Gaming Hardware", slug: "gaming-hardware" },
      { label: "Live Games", slug: "live-games" },
      { label: "Mobile Games", slug: "mobile-games" },
      { label: "Playing Cards", slug: "playing-cards" },
      { label: "Puzzles", slug: "puzzles" },
      { label: "STL", slug: "stl" },
      { label: "Tabletop Games", slug: "tabletop-games" },
      { label: "TTRPG", slug: "ttrpg" },
      { label: "Video Games", slug: "video-games" },
    ],
  },
  {
    label: "Journalism",
    slug: "journalism",
    subcategories: [
      { label: "Audio", slug: "audio" },
      { label: "Photo", slug: "photo" },
      { label: "Print", slug: "print" },
      { label: "Video", slug: "video" },
      { label: "Web", slug: "web" },
    ],
  },
  {
    label: "Music",
    slug: "music",
    subcategories: [
      { label: "Blues", slug: "blues" },
      { label: "Classical Music", slug: "classical-music" },
      { label: "Comedy", slug: "comedy" },
      { label: "Country & Folk", slug: "country-and-folk" },
      { label: "Electronic Music", slug: "electronic-music" },
      { label: "Faith", slug: "faith" },
      { label: "Hip-Hop", slug: "hip-hop" },
      { label: "Indie Rock", slug: "indie-rock" },
      { label: "Jazz", slug: "jazz" },
      { label: "Kids", slug: "kids" },
      { label: "Latin", slug: "latin" },
      { label: "Metal", slug: "metal" },
      { label: "Pop", slug: "pop" },
      { label: "Punk", slug: "punk" },
      { label: "R&B", slug: "r-and-b" },
      { label: "Rock", slug: "rock" },
      { label: "World Music", slug: "world-music" },
    ],
  },
  {
    label: "Photography",
    slug: "photography",
    subcategories: [
      { label: "Animals", slug: "animals" },
      { label: "Fine Art", slug: "fine-art" },
      { label: "Nature", slug: "nature" },
      { label: "People", slug: "people" },
      { label: "Photobooks", slug: "photobooks" },
    ],
  },
  {
    label: "Publishing",
    slug: "publishing",
    subcategories: [
      { label: "Academic", slug: "academic" },
      { label: "Anthologies", slug: "anthologies" },
      { label: "Art Books", slug: "art-books" },
      { label: "Audiobooks", slug: "audiobooks" },
      { label: "Calendars", slug: "calendars" },
      { label: "Children's Books", slug: "childrens-books" },
      { label: "Comedy", slug: "comedy" },
      { label: "Fiction", slug: "fiction" },
      { label: "Letterpress", slug: "letterpress" },
      { label: "Literary Journals", slug: "literary-journals" },
      { label: "Literary Spaces", slug: "literary-spaces" },
      { label: "Nonfiction", slug: "nonfiction" },
      { label: "Periodicals", slug: "periodicals" },
      { label: "Poetry", slug: "poetry" },
      { label: "Radio & Podcasts", slug: "radio-and-podcasts" },
      { label: "Translations", slug: "translations" },
      { label: "Young Adult", slug: "young-adult" },
      { label: "Zines", slug: "zines" },
    ],
  },
  {
    label: "Technology",
    slug: "technology",
    subcategories: [
      { label: "3D Printing", slug: "3d-printing" },
      { label: "Apps", slug: "apps" },
      { label: "Camera Equipment", slug: "camera-equipment" },
      { label: "DIY Electronics", slug: "diy-electronics" },
      { label: "Fabrication Tools", slug: "fabrication-tools" },
      { label: "Flight", slug: "flight" },
      { label: "Gadgets", slug: "gadgets" },
      { label: "Hardware", slug: "hardware" },
      { label: "Makerspaces", slug: "makerspaces" },
      { label: "Robots", slug: "robots" },
      { label: "Software", slug: "software" },
      { label: "Sound", slug: "sound" },
      { label: "Space Exploration", slug: "space-exploration" },
      { label: "Wearables", slug: "wearables" },
      { label: "Web", slug: "web" },
    ],
  },
  {
    label: "Theater",
    slug: "theater",
    subcategories: [
      { label: "Comedy", slug: "comedy" },
      { label: "Experimental", slug: "experimental" },
      { label: "Festivals", slug: "festivals" },
      { label: "Immersive", slug: "immersive" },
      { label: "Musical", slug: "musical" },
      { label: "Plays", slug: "plays" },
      { label: "Spaces", slug: "spaces" },
    ],
  },
] as const satisfies TaxonomyDefinition;

export type CampaignCategorySlug = (typeof taxonomyDefinition)[number]["slug"];

export type CampaignSubcategorySlug =
  (typeof taxonomyDefinition)[number]["subcategories"][number]["slug"];

export type CampaignSubcategoryNode = {
  /** Globally unique, so a persisted filter never depends on the parent alone. */
  id: string;
  slug: CampaignSubcategorySlug;
  label: string;
  category: CampaignCategorySlug;
  sortOrder: number;
};

export type CampaignCategoryNode = {
  slug: CampaignCategorySlug;
  label: string;
  sortOrder: number;
  subcategories: readonly CampaignSubcategoryNode[];
};

export const campaignCategories: readonly CampaignCategoryNode[] =
  taxonomyDefinition.map((category, categoryIndex) => ({
    label: category.label,
    slug: category.slug,
    sortOrder: categoryIndex,
    subcategories: category.subcategories.map((subcategory, subIndex) => ({
      category: category.slug,
      id: `${category.slug}/${subcategory.slug}`,
      label: subcategory.label,
      slug: subcategory.slug,
      sortOrder: subIndex,
    })),
  }));

function assertTaxonomyIsSound(
  categories: readonly CampaignCategoryNode[],
): void {
  const categorySlugs = new Set<string>();
  const subcategoryIds = new Set<string>();

  for (const category of categories) {
    if (categorySlugs.has(category.slug)) {
      throw new Error(`Duplicate campaign category slug: ${category.slug}`);
    }
    categorySlugs.add(category.slug);

    const labels = new Set<string>();
    for (const subcategory of category.subcategories) {
      if (labels.has(subcategory.label)) {
        throw new Error(
          `Duplicate campaign subcategory label in ${category.slug}: ${subcategory.label}`,
        );
      }
      labels.add(subcategory.label);

      if (subcategoryIds.has(subcategory.id)) {
        throw new Error(`Duplicate campaign subcategory id: ${subcategory.id}`);
      }
      subcategoryIds.add(subcategory.id);
    }
  }
}

assertTaxonomyIsSound(campaignCategories);

const categoryBySlug = new Map(
  campaignCategories.map((category) => [category.slug, category]),
);

const subcategoryById = new Map(
  campaignCategories.flatMap((category) =>
    category.subcategories.map(
      (subcategory) => [subcategory.id, subcategory] as const,
    ),
  ),
);

export function isCampaignCategorySlug(
  value: string,
): value is CampaignCategorySlug {
  return categoryBySlug.has(value as CampaignCategorySlug);
}

export function isCampaignSubcategoryOf(
  categorySlug: string,
  subcategorySlug: string,
): boolean {
  return Boolean(findCampaignSubcategory(categorySlug, subcategorySlug));
}

export function findCampaignCategory(
  slug: string,
): CampaignCategoryNode | null {
  return categoryBySlug.get(slug as CampaignCategorySlug) ?? null;
}

export function findCampaignSubcategory(
  categorySlug: string,
  subcategorySlug: string,
): CampaignSubcategoryNode | null {
  return subcategoryById.get(`${categorySlug}/${subcategorySlug}`) ?? null;
}

export function campaignCategoryLabel(slug: CampaignCategorySlug): string {
  return categoryBySlug.get(slug)?.label ?? slug;
}

export function campaignSubcategoryLabel(
  categorySlug: CampaignCategorySlug,
  subcategorySlug: CampaignSubcategorySlug,
): string {
  return (
    findCampaignSubcategory(categorySlug, subcategorySlug)?.label ??
    subcategorySlug
  );
}

export function campaignCategoryPath(
  categorySlug: CampaignCategorySlug,
  subcategorySlug?: CampaignSubcategorySlug | null,
): string {
  const base = `/campaigns/categories/${categorySlug}`;
  return subcategorySlug ? `${base}/${subcategorySlug}` : base;
}

/** All category/subcategory route pairs, for static params and the sitemap. */
export const campaignCategoryRoutes: readonly {
  categorySlug: CampaignCategorySlug;
  subcategorySlug: CampaignSubcategorySlug | null;
}[] = campaignCategories.flatMap((category) => [
  { categorySlug: category.slug, subcategorySlug: null },
  ...category.subcategories.map((subcategory) => ({
    categorySlug: category.slug,
    subcategorySlug: subcategory.slug,
  })),
]);
