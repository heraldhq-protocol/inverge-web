import { previewIdeas } from "@/features/home/content/preview-data";
import type {
  DiscoveryIdea,
  IdeaRegion,
  IdeasDiscoveryData,
} from "@/features/ideas/types";

function discoveryIdea(
  idea: (typeof previewIdeas)[keyof typeof previewIdeas],
  details: {
    location: string;
    promoted?: boolean;
    publishedOrder: number;
    region: IdeaRegion;
  },
): DiscoveryIdea {
  return { ...idea, ...details };
}

export const ideasPreviewData: IdeasDiscoveryData = {
  featured: [
    discoveryIdea(previewIdeas.campusKonekt, {
      location: "Lagos, Nigeria",
      promoted: true,
      publishedOrder: 15,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.sunGrid, {
      location: "Enugu, Nigeria",
      publishedOrder: 13,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.farmLink, {
      location: "Kano, Nigeria",
      publishedOrder: 11,
      region: "nigeria",
    }),
  ],
  ideas: [
    discoveryIdea(previewIdeas.studyMate, {
      location: "Ibadan, Nigeria",
      publishedOrder: 14,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.zippyCampus, {
      location: "Lagos, Nigeria",
      publishedOrder: 12,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.cropCircle, {
      location: "Abeokuta, Nigeria",
      publishedOrder: 10,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.agroRoute, {
      location: "Abuja, Nigeria",
      publishedOrder: 9,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.ecoCharge, {
      location: "Port Harcourt, Nigeria",
      publishedOrder: 8,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.solarChill, {
      location: "Kaduna, Nigeria",
      publishedOrder: 7,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.naijaCraft, {
      location: "Kano, Nigeria",
      publishedOrder: 6,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.storyFoundry, {
      location: "Lagos, Nigeria",
      publishedOrder: 5,
      region: "nigeria",
    }),
    discoveryIdea(previewIdeas.skillCircle, {
      location: "Kumasi, Ghana",
      publishedOrder: 4,
      region: "ghana",
    }),
    discoveryIdea(previewIdeas.careBridge, {
      location: "Dakar, Senegal",
      publishedOrder: 3,
      region: "senegal",
    }),
    discoveryIdea(previewIdeas.marketBasket, {
      location: "Accra, Ghana",
      publishedOrder: 2,
      region: "ghana",
    }),
    discoveryIdea(previewIdeas.kitchenCollective, {
      location: "Accra, Ghana",
      publishedOrder: 1,
      region: "ghana",
    }),
  ],
};
