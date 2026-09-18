import type { HomeDashboardData, IdeaSummary } from "@/features/home/types";

const ideas = {
  campusKonekt: {
    id: "campus-konekt",
    artwork: "campus",
    category: "Campus technology",
    creator: "Tobi Adeyemi",
    creatorInitials: "TA",
    description:
      "A student marketplace helping campus businesses reach the people already around them.",
    prePledged: { atomic: "840000000", currency: "NGN", decimals: 2 },
    supporters: 412,
    title: "CampusKonekt",
    validationPercent: 73,
  },
  sunGrid: {
    id: "sungrid-community-power",
    artwork: "energy",
    category: "Clean energy",
    creator: "Amaka Nwosu",
    creatorInitials: "AN",
    description:
      "Shared solar infrastructure for small businesses in communities with unreliable power.",
    prePledged: { atomic: "1210000000", currency: "NGN", decimals: 2 },
    supporters: 286,
    title: "SunGrid Community Power",
    validationPercent: 61,
  },
  farmLink: {
    id: "farmlink-coldbox",
    artwork: "food",
    category: "Agriculture",
    creator: "Ibrahim Musa",
    creatorInitials: "IM",
    description:
      "Affordable cold storage helping small-scale farmers reduce post-harvest losses.",
    prePledged: { atomic: "670000000", currency: "NGN", decimals: 2 },
    supporters: 193,
    title: "FarmLink ColdBox",
    validationPercent: 48,
  },
  studyMate: {
    id: "studymate-ng",
    artwork: "community",
    category: "Education technology",
    creator: "Zainab Bello",
    creatorInitials: "ZB",
    description:
      "An AI study companion helping Nigerian students learn smarter and faster.",
    prePledged: { atomic: "280000000", currency: "NGN", decimals: 2 },
    supporters: 112,
    title: "StudyMate NG",
    validationPercent: 67,
  },
  naijaCraft: {
    id: "naijacraft-collective",
    artwork: "creative",
    category: "Creative",
    creator: "Adaeze Obi",
    creatorInitials: "AO",
    description:
      "A digital marketplace for Nigerian artisans and handmade goods.",
    prePledged: { atomic: "190000000", currency: "NGN", decimals: 2 },
    supporters: 98,
    title: "NaijaCraft Collective",
    validationPercent: 54,
  },
  zippyCampus: {
    id: "zippy-campus",
    artwork: "logistics",
    category: "Logistics",
    creator: "Chinedu Eze",
    creatorInitials: "CE",
    description:
      "On-demand deliveries connecting students to anything on campus.",
    prePledged: { atomic: "160000000", currency: "NGN", decimals: 2 },
    supporters: 76,
    title: "ZippyCampus",
    validationPercent: 45,
  },
} satisfies Record<string, IdeaSummary>;

export const homePreviewData: HomeDashboardData = {
  user: { firstName: "Amara" },
  stats: {
    ideasSupported: 4,
    activePrePledges: 3,
    feedbackResponses: 2,
  },
  featuredIdeas: [ideas.campusKonekt, ideas.sunGrid, ideas.farmLink],
  prePledges: [
    {
      idea: ideas.campusKonekt,
      intent: { atomic: "5000000", currency: "NGN", decimals: 2 },
      status: "waiting",
    },
    {
      idea: ideas.sunGrid,
      intent: { atomic: "3000000", currency: "NGN", decimals: 2 },
      status: "gathering",
    },
    {
      idea: ideas.farmLink,
      intent: { atomic: "2000000", currency: "NGN", decimals: 2 },
      status: "gathering",
    },
  ],
  discoverIdeas: [ideas.studyMate, ideas.naijaCraft, ideas.zippyCampus],
};
