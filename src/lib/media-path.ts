/**
 * The stored-media path contract.
 *
 * An uploaded image is addressed by its asset id, never by a storage URL:
 * `src === "/api/media/<assetId>"`. The read route resolves that id against the
 * API, checks whether the viewer may see it, and redirects to a short-lived
 * signed URL. The provider therefore never appears in a database row, a JSON
 * payload or a component prop, and swapping storage does not change any of them.
 *
 * This module is deliberately dependency-free so both the generic UI layer
 * (`components/ui`) and the media feature can share one definition. The API has
 * the same rule in `inverge-api/src/common/media/media-key.ts`; the two copies
 * are unit-tested because the services deploy independently.
 */

export const MEDIA_PATH_PREFIX = "/api/media/";

/** Matches the API's asset id shape (a Prisma cuid). */
const ASSET_ID = /^[a-z0-9]{20,40}$/;

export function assetIdFromMediaPath(value: string): string | null {
  if (!value.startsWith(MEDIA_PATH_PREFIX)) return null;
  const id = value.slice(MEDIA_PATH_PREFIX.length);
  return ASSET_ID.test(id) ? id : null;
}

/**
 * True when a stored `src` is one of our own assets.
 *
 * Callers use this to decide *how* to render: the read route needs the viewer's
 * session, so the image must not be handed to Next's optimiser, which fetches
 * the source without cookies.
 */
export function isStoredMediaPath(value: string | null | undefined): boolean {
  return typeof value === "string" && assetIdFromMediaPath(value) !== null;
}

export function mediaPathFor(assetId: string): string {
  return `${MEDIA_PATH_PREFIX}${assetId}`;
}
