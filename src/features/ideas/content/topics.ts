import type { Topic } from "@/features/ideas/types";

/**
 * The topic directory.
 *
 * Topics record membership for every idea carrying the tag, public and private
 * — including ideas that belong to another creator. A surface decides what it
 * may show through `ideasInTopic`, so a topic's grid and its count never
 * surface an unlisted idea.
 */
export const previewTopics: Topic[] = [
  {
    description: "Businesses built around campus life and the people on it.",
    ideaIds: ["campus-konekt", "studymate-ng", "zippy-campus"],
    slug: "campus-life",
    title: "Campus life",
  },
  {
    description: "Keeping produce, medicine, and food usable for longer.",
    ideaIds: ["farmlink-coldbox", "solarchill"],
    slug: "cold-chain",
    title: "Cold chain",
  },
  {
    description: "Power where the grid does not reliably reach.",
    ideaIds: [
      "sungrid-community-power",
      "ecocharge-kiosks",
      "solarchill",
      "kano-grain-ledger",
    ],
    slug: "power-access",
    title: "Power access",
  },
  {
    description: "Craft, film, and music made by independent African makers.",
    ideaIds: ["naijacraft-collective", "story-foundry", "adire-studio"],
    slug: "made-by-hand",
    title: "Made by hand",
  },
  {
    description: "Support networks that already exist in a neighbourhood.",
    ideaIds: ["care-bridge", "skill-circle", "lagos-water-watch"],
    slug: "local-care",
    title: "Local care",
  },
  {
    description: "Shared space and buying power for small food businesses.",
    ideaIds: ["kitchen-collective", "market-basket"],
    slug: "shared-kitchens",
    title: "Shared kitchens",
  },
];
