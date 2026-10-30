/**
 * Media references in the web app.
 *
 * Shared by the uploader, the editors and every renderer, so "is this one of our
 * assets or somebody else's URL" is answered in one place. The path contract
 * itself lives in `@/lib/media-path` because the generic renderer under
 * `components/ui` needs it without importing a feature.
 *
 * The API has the same two rules in `inverge-api/src/common/media`. They are
 * duplicated deliberately: the two services deploy independently and neither
 * imports the other's source. Both copies are unit-tested, and the shape they
 * agree on is one line of documentation in `docs/media/README.md`:
 * `src === "/api/media/<assetId>"` for an upload, `https://…` for a reference.
 */

export {
  assetIdFromMediaPath,
  isStoredMediaPath,
  MEDIA_PATH_PREFIX,
  mediaPathFor,
} from "@/lib/media-path";

/**
 * Local, advisory limits.
 *
 * The server's configured limits are authoritative and are read from
 * `GET /api/media/config`; these exist so an obviously wrong file is refused
 * before a network round trip, and so the component has a sane default while the
 * config request is in flight.
 *
 * Images only. A demo or presentation video belongs on YouTube or Vimeo and is
 * linked, then played in the page hero; uploading one here would need
 * transcoding, moderation and a video CDN this deployment does not have.
 */
export const DEFAULT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_IMAGE_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${Number(mb.toFixed(mb >= 10 ? 0 : 1))} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export type MediaCapabilities = {
  uploadsEnabled: boolean;
  provider: string;
  maxImageBytes: number;
  allowedImageTypes: string[];
  videoUploadEnabled: boolean;
  youtubeMetadataEnabled: boolean;
};
