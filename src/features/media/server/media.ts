import "server-only";

import { fetchApiJson } from "@/lib/api/server";

/**
 * Server-side calls to the API's media routes.
 *
 * The browser never holds the session token, so every upload step goes through
 * the BFF route handlers in `src/app/api/media`. This module never reads a cookie
 * itself, which keeps it usable from both a route handler and a server component.
 */

const SHORT_TIMEOUT_MS = 5_000;

export type MediaCapabilitiesView = {
  uploadsEnabled: boolean;
  provider: string;
  maxImageBytes: number;
  allowedImageTypes: string[];
  videoUploadEnabled: boolean;
  youtubeMetadataEnabled: boolean;
};

/**
 * What this deployment accepts.
 *
 * A missing API or a failed read is reported as "uploads unavailable" rather than
 * a guessed limit: a control that offers an upload the server will reject is
 * worse than one that explains why it is off.
 */
export function readMediaCapabilities(): Promise<MediaCapabilitiesView | null> {
  return fetchApiJson<MediaCapabilitiesView>("/media/config", {
    timeoutMs: SHORT_TIMEOUT_MS,
  }).catch(() => null);
}
