import { isStoredMediaPath } from "@/lib/media-path";

/**
 * Avatars are either a provider image or one of our own uploads. Only hosts the
 * Next image loader is configured for may reach `next/image`; an upload is
 * served by the media route instead; everything else falls back to initials in
 * the UI. Keep this list in sync with `images.remotePatterns` in
 * `next.config.ts`.
 */
const GOOGLE_AVATAR_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
]);

/** A browser-safe upper bound; real provider avatar URLs are far shorter. */
const MAX_AVATAR_URL_LENGTH = 2048;

/**
 * Returns a public avatar reference only when it is either one of our own
 * uploaded assets or an HTTPS URL on an allowlisted host and path. Shared by
 * the session projection and the public profile so a provider image can never
 * become an arbitrary remote request.
 */
export function safeAvatarUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw || raw.length > MAX_AVATAR_URL_LENGTH) return null;

  // A picture the creator uploaded is addressed by its own asset id, not a
  // URL: it is served same-origin by the media route, which authorises the
  // viewer and redirects to a short-lived signed link. It never reaches the
  // optimiser, so no host has to be allowlisted for it.
  if (isStoredMediaPath(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password) return null;

  if (url.hostname === "images.unsplash.com") {
    // Match the path shape the image config serves; a host-only check would
    // still let an unsupported path reach next/image and fail at render time.
    return url.pathname.startsWith("/photo-") ? url.toString() : null;
  }

  if (GOOGLE_AVATAR_HOSTS.has(url.hostname)) {
    // Google profile images live under /a/ (older URLs use /a-/). Restricting
    // the path keeps the allowlist about profile images, not all of Google's
    // user-content host.
    return url.pathname.startsWith("/a/") || url.pathname.startsWith("/a-/")
      ? url.toString()
      : null;
  }

  return null;
}
