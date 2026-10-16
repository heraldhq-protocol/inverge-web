import { previewIdeas } from "@/features/home/content/preview-data";
import type {
  DiscoveryIdea,
  IdeaRegion,
  IdeasDiscoveryData,
  IdeaVisibility,
} from "@/features/ideas/types";

function discoveryIdea(
  idea: (typeof previewIdeas)[keyof typeof previewIdeas],
  details: {
    location: string;
    promoted?: boolean;
    publishedOrder: number;
    region: IdeaRegion;
    visibility: IdeaVisibility;
  },
): DiscoveryIdea {
  return { ...idea, ...details };
}

/**
 * What discovery shows.
 *
 * Every idea here is public — a private idea is unlisted, so it has no place in
 * this surface at all. The creator's own private ideas live in
 * `preview-my-ideas.ts`.
 */
export const ideasPreviewData: IdeasDiscoveryData = {
  featured: [
    discoveryIdea(previewIdeas.campusKonekt, {
      location: "Lagos, Nigeria",
      promoted: true,
      publishedOrder: 15,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.sunGrid, {
      location: "Enugu, Nigeria",
      publishedOrder: 13,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.farmLink, {
      location: "Kano, Nigeria",
      publishedOrder: 11,
      region: "nigeria",
      visibility: "public",
    }),
  ],
  ideas: [
    discoveryIdea(previewIdeas.studyMate, {
      location: "Ibadan, Nigeria",
      publishedOrder: 14,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.zippyCampus, {
      location: "Lagos, Nigeria",
      publishedOrder: 12,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.cropCircle, {
      location: "Abeokuta, Nigeria",
      publishedOrder: 10,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.agroRoute, {
      location: "Abuja, Nigeria",
      publishedOrder: 9,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.ecoCharge, {
      location: "Port Harcourt, Nigeria",
      publishedOrder: 8,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.solarChill, {
      location: "Kaduna, Nigeria",
      publishedOrder: 7,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.naijaCraft, {
      location: "Kano, Nigeria",
      publishedOrder: 6,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.storyFoundry, {
      location: "Lagos, Nigeria",
      publishedOrder: 5,
      region: "nigeria",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.skillCircle, {
      location: "Kumasi, Ghana",
      publishedOrder: 4,
      region: "ghana",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.careBridge, {
      location: "Dakar, Senegal",
      publishedOrder: 3,
      region: "senegal",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.marketBasket, {
      location: "Accra, Ghana",
      publishedOrder: 2,
      region: "ghana",
      visibility: "public",
    }),
    discoveryIdea(previewIdeas.kitchenCollective, {
      location: "Accra, Ghana",
      publishedOrder: 1,
      region: "ghana",
      visibility: "public",
    }),
  ],
};
