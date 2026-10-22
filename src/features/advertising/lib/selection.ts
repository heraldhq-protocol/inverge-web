import {
  getAdPlacement,
  placementAllowsViewport,
} from "@/features/advertising/lib/placements";
import { isSafeAdDestination } from "@/features/advertising/lib/validation";
import type {
  AdCreative,
  AdEligibility,
  AdPageContext,
  AdPlacement,
  AdPlacementId,
  AdSelection,
  AdSelectionContext,
  AdViewport,
} from "@/features/advertising/types";

/**
 * Deterministic advertisement selection.
 *
 * There is no random source and no request inspection: the same creative set,
 * date, page context, and viewport always choose the same advertisement. The
 * daily rotation bucket keeps a single advertiser from occupying a slot
 * indefinitely without making the page non-deterministic between a server
 * render and its hydration.
 */

const DAY_MS = 86_400_000;

export function viewportForWidth(width: number): AdViewport {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function rotationBucket(nowIso: string): number {
  const parsed = Date.parse(nowIso);
  if (Number.isNaN(parsed)) return 0;
  return Math.floor(parsed / DAY_MS);
}

function hashSeed(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function relevanceMatches(
  values: readonly string[],
  candidate: string | undefined,
): boolean {
  if (values.length === 0) return true;
  if (!candidate) return false;
  return values.includes(candidate);
}

function isCreativeRelevant(
  creative: AdCreative,
  page: AdPageContext,
): boolean {
  return (
    relevanceMatches(creative.categories, page.category) &&
    relevanceMatches(creative.regions, page.region)
  );
}

/**
 * Whether a placement may appear in this viewport at all.
 *
 * Rail placements are desktop-only. The CSS wrapper also hides them below
 * `lg`, so a server render that has no viewport information cannot leak a rail
 * card into a phone layout.
 */
export function placementEligibility(
  placement: AdPlacement,
  context: Pick<AdSelectionContext, "flags" | "consent" | "page" | "viewport">,
): AdEligibility {
  if (!context.flags.enabled) return { eligible: false, reason: "disabled" };
  if (!placement.pageKinds.includes(context.page.kind)) {
    return { eligible: false, reason: "placement-not-allowed" };
  }
  if (!placementAllowsViewport(placement, context.viewport)) {
    return { eligible: false, reason: "viewport-not-eligible" };
  }
  if (
    placement.minimumOrganicResults !== undefined &&
    (context.page.organicResultCount ?? 0) < placement.minimumOrganicResults
  ) {
    return { eligible: false, reason: "insufficient-organic-results" };
  }
  if (placement.kind === "third-party") {
    if (!context.flags.thirdPartyEnabled) {
      return { eligible: false, reason: "third-party-disabled" };
    }
    if (placement.requiresConsent && !context.consent.personalisedAds) {
      return { eligible: false, reason: "consent-required" };
    }
  }
  return { eligible: true };
}

export function creativeEligibility(
  creative: AdCreative,
  placement: AdPlacement,
  context: AdSelectionContext,
): AdEligibility {
  const placementResult = placementEligibility(placement, context);
  if (!placementResult.eligible) return placementResult;

  if (context.seenCreativeIds?.includes(creative.id)) {
    return { eligible: false, reason: "frequency-capped" };
  }
  if (context.excludeCreativeIds?.includes(creative.id)) {
    return { eligible: false, reason: "excluded" };
  }
  if (creative.status !== "approved") {
    return { eligible: false, reason: "creative-not-approved" };
  }
  if (!creative.placements.includes(placement.id)) {
    return { eligible: false, reason: "placement-not-allowed" };
  }
  if (!placement.formats.includes(creative.format)) {
    return { eligible: false, reason: "format-not-allowed" };
  }
  if (!isSafeAdDestination(creative.destination)) {
    return { eligible: false, reason: "destination-invalid" };
  }
  if (!isCreativeRelevant(creative, context.page)) {
    return { eligible: false, reason: "not-relevant" };
  }

  const now = Date.parse(context.now);
  const startsAt = Date.parse(creative.startsAt);
  const endsAt = Date.parse(creative.endsAt);
  if (
    Number.isNaN(now) ||
    Number.isNaN(startsAt) ||
    Number.isNaN(endsAt) ||
    now < startsAt ||
    now >= endsAt
  ) {
    return { eligible: false, reason: "not-in-schedule" };
  }

  return { eligible: true };
}

function scoreCreative(
  creative: AdCreative,
  placementId: AdPlacementId,
  nowIso: string,
): number {
  const rotation = hashSeed(
    `${creative.id}:${placementId}:${rotationBucket(nowIso)}`,
  );
  return creative.priority * 1_000_000 + rotation;
}

export function selectAdvertisement(
  creatives: readonly AdCreative[],
  placementId: AdPlacementId,
  context: AdSelectionContext,
): AdSelection | null {
  const placement = getAdPlacement(placementId);
  if (!placement) return null;
  if (!placementEligibility(placement, context).eligible) return null;

  const eligible = creatives
    .filter(
      (creative) => creativeEligibility(creative, placement, context).eligible,
    )
    .toSorted(
      (left, right) =>
        scoreCreative(right, placementId, context.now) -
        scoreCreative(left, placementId, context.now),
    );

  const creative = eligible[0];
  return creative ? { creative, placement } : null;
}

/**
 * Select a page's worth of advertisements.
 *
 * `placements` is ordered by reading priority. A creative appears once, and a
 * placement never exceeds its declared page density. The caller must still
 * render the same slots it requested; this function never invents a slot that
 * the page did not ask for.
 */
export function selectPageAdvertisements(
  creatives: readonly AdCreative[],
  placements: readonly AdPlacementId[],
  context: AdSelectionContext,
): readonly AdSelection[] {
  const selections: AdSelection[] = [];
  const usedCreatives: string[] = [];
  const usedPerPlacement: Record<string, number> = {};

  for (const placementId of placements) {
    const placement = getAdPlacement(placementId);
    if (!placement) continue;

    const used = usedPerPlacement[placementId] ?? 0;
    if (used >= placement.maxPerPage) continue;

    const selection = selectAdvertisement(creatives, placementId, {
      ...context,
      excludeCreativeIds: [
        ...(context.excludeCreativeIds ?? []),
        ...usedCreatives,
      ],
    });
    if (!selection) continue;

    selections.push(selection);
    usedCreatives.push(selection.creative.id);
    usedPerPlacement[placementId] = used + 1;
  }

  return selections;
}
