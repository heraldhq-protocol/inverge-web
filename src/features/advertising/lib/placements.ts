import type { AdPlacement, AdPlacementId } from "@/features/advertising/types";

/**
 * The placement registry.
 *
 * Every slot the product can fill is declared here. A page asks for a placement
 * by id; it cannot invent a format, a breakpoint, or a density rule at the call
 * site. Changing inventory therefore starts with a reviewable edit to this list
 * rather than with a component that quietly renders a new ad shape.
 */
export const AD_PLACEMENTS: readonly AdPlacement[] = [
  {
    description:
      "One native sponsored card in the campaign grid, after at least six organic results.",
    formats: ["native-card"],
    id: "campaign-feed-inline",
    kind: "first-party",
    label: "Campaign feed card",
    maxPerPage: 1,
    minimumOrganicResults: 6,
    pageKinds: ["campaigns"],
    requiresConsent: false,
    viewports: ["mobile", "tablet", "desktop"],
  },
  {
    description:
      "A wide sponsored banner after the campaign tabs, below the funding decision.",
    formats: ["banner"],
    id: "campaign-detail-inline",
    kind: "first-party",
    label: "Campaign detail banner",
    maxPerPage: 1,
    pageKinds: ["campaign"],
    requiresConsent: false,
    viewports: ["mobile", "tablet", "desktop"],
  },
  {
    description:
      "A sponsored card in the desktop campaign rail, below the campaign facts.",
    formats: ["sidebar"],
    hiddenBelow: "lg",
    id: "campaign-detail-rail",
    kind: "first-party",
    label: "Campaign detail rail",
    maxPerPage: 1,
    pageKinds: ["campaign"],
    requiresConsent: false,
    viewports: ["desktop"],
  },
  {
    description:
      "One native sponsored card in the idea grid, after at least six organic results.",
    formats: ["native-card"],
    id: "idea-feed-inline",
    kind: "first-party",
    label: "Idea feed card",
    maxPerPage: 1,
    minimumOrganicResults: 6,
    pageKinds: ["ideas"],
    requiresConsent: false,
    viewports: ["mobile", "tablet", "desktop"],
  },
  {
    description:
      "A wide sponsored banner inside an idea story, after the solution section.",
    formats: ["banner"],
    id: "idea-detail-inline",
    kind: "first-party",
    label: "Idea detail banner",
    maxPerPage: 1,
    pageKinds: ["idea"],
    requiresConsent: false,
    viewports: ["mobile", "tablet", "desktop"],
  },
  {
    description: "A sponsored card in the desktop idea rail.",
    formats: ["sidebar"],
    hiddenBelow: "lg",
    id: "idea-detail-rail",
    kind: "first-party",
    label: "Idea detail rail",
    maxPerPage: 1,
    pageKinds: ["idea"],
    requiresConsent: false,
    viewports: ["desktop"],
  },
  {
    description:
      "A wide sponsored banner between editorial sections on a guide or journal entry.",
    formats: ["banner"],
    id: "content-inline",
    kind: "first-party",
    label: "Editorial inline banner",
    maxPerPage: 1,
    pageKinds: ["guide", "journal"],
    requiresConsent: false,
    viewports: ["mobile", "tablet", "desktop"],
  },
  {
    description: "A sponsored card in the desktop editorial rail.",
    formats: ["sidebar"],
    hiddenBelow: "lg",
    id: "content-sidebar",
    kind: "first-party",
    label: "Editorial rail",
    maxPerPage: 1,
    pageKinds: ["guide", "journal"],
    requiresConsent: false,
    viewports: ["desktop"],
  },
  {
    description:
      "An isolated third-party AdSense slot. It never loads before an explicit personalised-advertising choice.",
    formats: ["third-party"],
    id: "editorial-third-party",
    kind: "third-party",
    label: "Third-party editorial slot",
    maxPerPage: 1,
    pageKinds: ["guide", "journal"],
    requiresConsent: true,
    viewports: ["desktop", "tablet"],
  },
];

export const AD_PLACEMENTS_BY_ID: Readonly<Record<AdPlacementId, AdPlacement>> =
  Object.fromEntries(
    AD_PLACEMENTS.map((placement) => [placement.id, placement]),
  ) as Record<AdPlacementId, AdPlacement>;

export const AD_PLACEMENT_IDS = AD_PLACEMENTS.map(
  (placement) => placement.id,
) as readonly AdPlacementId[];

export function getAdPlacement(id: string): AdPlacement | undefined {
  return (
    AD_PLACEMENTS_BY_ID as Readonly<Record<string, AdPlacement | undefined>>
  )[id];
}

export function isAdPlacementId(value: string): value is AdPlacementId {
  return (AD_PLACEMENT_IDS as readonly string[]).includes(value);
}

export function placementAllowsViewport(
  placement: AdPlacement,
  viewport: AdPlacement["viewports"][number],
): boolean {
  return placement.viewports.includes(viewport);
}
