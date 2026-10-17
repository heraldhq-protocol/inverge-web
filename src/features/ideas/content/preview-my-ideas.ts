import type { MyIdea } from "@/features/ideas/types";

const COVER_STUDIO =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=800&fit=crop";
const COVER_TEAM =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=900&fit=crop";

/**
 * What the signed-in preview account (Amara) has created.
 *
 * SkillCircle is the one she published, so it is the only one that appears in
 * discovery; the rest are unlisted and reachable by link. Status and visibility
 * stay independent on purpose — the studio idea has cleared FR-204's threshold
 * and still is not listed anywhere public.
 */
export const previewMyIdeas: MyIdea[] = [
  {
    artwork: "food",
    category: "Agriculture",
    cover: null,
    discoveryCategory: "agriculture",
    id: "kano-grain-ledger",
    prePledged: { atomic: "0", currency: "USD", decimals: 2 },
    status: "draft",
    supporters: 0,
    title: "Kano Grain Ledger",
    updatedAt: "2026-10-15T16:20:00.000Z",
    validationPercent: 0,
    visibility: "private",
  },
  {
    artwork: "creative",
    category: "Creative",
    cover: COVER_STUDIO,
    discoveryCategory: "creative",
    id: "adire-studio",
    prePledged: { atomic: "31000", currency: "USD", decimals: 2 },
    status: "threshold-met",
    supporters: 240,
    title: "Adire Studio Collective",
    updatedAt: "2026-10-14T08:30:00.000Z",
    validationPercent: 88,
    visibility: "private",
  },
  {
    artwork: "community",
    category: "Community",
    cover: COVER_TEAM,
    discoveryCategory: "community",
    id: "skill-circle",
    prePledged: { atomic: "14500", currency: "USD", decimals: 2 },
    status: "validating",
    supporters: 83,
    title: "SkillCircle",
    updatedAt: "2026-10-11T10:00:00.000Z",
    validationPercent: 49,
    visibility: "public",
  },
  {
    artwork: "community",
    category: "Community",
    cover: null,
    discoveryCategory: "community",
    id: "lagos-water-watch",
    prePledged: { atomic: "9600", currency: "USD", decimals: 2 },
    status: "validating",
    supporters: 58,
    title: "Lagos Water Watch",
    updatedAt: "2026-10-09T12:15:00.000Z",
    validationPercent: 34,
    visibility: "private",
  },
];
