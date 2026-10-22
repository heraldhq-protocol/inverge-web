import { previewIdeas } from "@/features/home/content/preview-data";
import { previewCoverFor } from "@/features/ideas/content/preview-covers";
import type {
  IdeaCategorySlug,
  IdeaSubcategorySlug,
} from "@/features/ideas/lib/taxonomy";
import type {
  DiscoveryIdea,
  IdeaRegion,
  IdeasDiscoveryData,
  IdeaVisibility,
} from "@/features/ideas/types";

function discoveryIdea(
  idea: (typeof previewIdeas)[keyof typeof previewIdeas],
  details: {
    feedbackResponses: number;
    location: string;
    promoted?: boolean;
    publishedOrder: number;
    region: IdeaRegion;
    taxonomyCategory: IdeaCategorySlug;
    taxonomySubcategory: IdeaSubcategorySlug;
    visibility: IdeaVisibility;
  },
): DiscoveryIdea {
  return { ...idea, ...details, cover: previewCoverFor(idea.id) };
}

/**
 * What discovery shows.
 *
 * Every idea here is public — a private idea is unlisted, so it has no place in
 * this surface at all. The creator's own private ideas live in
 * `preview-my-ideas.ts`. Feedback counts are FR-203 response volume, kept
 * separate from support and pre-pledge intent because each signal tells a
 * different story.
 *
 * `taxonomyCategory` and `taxonomySubcategory` use the shared campaign
 * taxonomy, so idea discovery filters use the same categories and children as
 * campaign discovery. `discoveryCategory` on each summary remains the broader
 * routing bucket used by the idea builder and ideathon.
 */
export const ideasPreviewData: IdeasDiscoveryData = {
  featured: [
    discoveryIdea(previewIdeas.campusKonekt, {
      feedbackResponses: 38,
      location: "Lagos, Nigeria",
      promoted: true,
      publishedOrder: 15,
      region: "nigeria",
      taxonomyCategory: "technology",
      taxonomySubcategory: "apps",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.sunGrid, {
      feedbackResponses: 29,
      location: "Enugu, Nigeria",
      publishedOrder: 13,
      region: "nigeria",
      taxonomyCategory: "technology",
      taxonomySubcategory: "hardware",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.farmLink, {
      feedbackResponses: 17,
      location: "Kano, Nigeria",
      publishedOrder: 11,
      region: "nigeria",
      taxonomyCategory: "food",
      taxonomySubcategory: "farms",
      visibility: "public",
    }),
  ],
  ideas: [
    discoveryIdea(previewIdeas.studyMate, {
      feedbackResponses: 12,
      location: "Ibadan, Nigeria",
      publishedOrder: 14,
      region: "nigeria",
      taxonomyCategory: "technology",
      taxonomySubcategory: "apps",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.zippyCampus, {
      feedbackResponses: 9,
      location: "Lagos, Nigeria",
      publishedOrder: 12,
      region: "nigeria",
      taxonomyCategory: "technology",
      taxonomySubcategory: "software",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.cropCircle, {
      feedbackResponses: 11,
      location: "Abeokuta, Nigeria",
      publishedOrder: 10,
      region: "nigeria",
      taxonomyCategory: "food",
      taxonomySubcategory: "farms",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.agroRoute, {
      feedbackResponses: 13,
      location: "Abuja, Nigeria",
      publishedOrder: 9,
      region: "nigeria",
      taxonomyCategory: "food",
      taxonomySubcategory: "farmers-markets",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.ecoCharge, {
      feedbackResponses: 15,
      location: "Port Harcourt, Nigeria",
      publishedOrder: 8,
      region: "nigeria",
      taxonomyCategory: "technology",
      taxonomySubcategory: "hardware",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.solarChill, {
      feedbackResponses: 16,
      location: "Kaduna, Nigeria",
      publishedOrder: 7,
      region: "nigeria",
      taxonomyCategory: "technology",
      taxonomySubcategory: "hardware",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.naijaCraft, {
      feedbackResponses: 10,
      location: "Kano, Nigeria",
      publishedOrder: 6,
      region: "nigeria",
      taxonomyCategory: "crafts",
      taxonomySubcategory: "diy",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.storyFoundry, {
      feedbackResponses: 8,
      location: "Lagos, Nigeria",
      publishedOrder: 5,
      region: "nigeria",
      taxonomyCategory: "film",
      taxonomySubcategory: "narrative-film",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.skillCircle, {
      feedbackResponses: 7,
      location: "Kumasi, Ghana",
      publishedOrder: 4,
      region: "ghana",
      taxonomyCategory: "technology",
      taxonomySubcategory: "apps",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.careBridge, {
      feedbackResponses: 9,
      location: "Dakar, Senegal",
      publishedOrder: 3,
      region: "senegal",
      taxonomyCategory: "technology",
      taxonomySubcategory: "software",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.marketBasket, {
      feedbackResponses: 11,
      location: "Accra, Ghana",
      publishedOrder: 2,
      region: "ghana",
      taxonomyCategory: "food",
      taxonomySubcategory: "farmers-markets",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.kitchenCollective, {
      feedbackResponses: 12,
      location: "Accra, Ghana",
      publishedOrder: 1,
      region: "ghana",
      taxonomyCategory: "food",
      taxonomySubcategory: "spaces",
      visibility: "public",
    }),
  ],
};
