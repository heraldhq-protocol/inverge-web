import "server-only";

import { previewAdCreatives } from "@/features/advertising/content/preview-advertising";
import { resolveAdFlags } from "@/features/advertising/lib/flags";
import { selectAdvertisement } from "@/features/advertising/lib/selection";
import type {
  AdPageContext,
  AdPlacementId,
  AdSelection,
} from "@/features/advertising/types";

/**
 * The web selection seam.
 *
 * A Server Component asks this module for one slot. It reads the environment
 * flag, the preview inventory, and a build/request timestamp, then returns only
 * an approved, in-schedule creative — or nothing. There is no cookie or header
 * read here, so the marketing routes stay statically renderable.
 *
 * When the API owns advertising, this file becomes the fetch boundary and the
 * pure selection module stays as the contract test.
 */
export function getAdSlotView({
  placementId,
  page,
  now = new Date().toISOString(),
  seenCreativeIds,
  excludeCreativeIds,
}: {
  placementId: AdPlacementId;
  page: AdPageContext;
  now?: string;
  seenCreativeIds?: readonly string[];
  excludeCreativeIds?: readonly string[];
}): AdSelection | null {
  return selectAdvertisement(previewAdCreatives, placementId, {
    consent: { personalisedAds: false },
    flags: resolveAdFlags(),
    now,
    page,
    // Server selection has no viewport. Rail placements advertise desktop-only
    // and are hidden by the wrapper below `lg`; the pure selector still checks
    // the declared desktop audience.
    viewport: "desktop",
    ...(excludeCreativeIds === undefined ? {} : { excludeCreativeIds }),
    ...(seenCreativeIds === undefined ? {} : { seenCreativeIds }),
  });
}
