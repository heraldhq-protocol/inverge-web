/**
 * Canonical site identity for every SEO surface: metadata, share images,
 * robots, sitemaps, and JSON-LD.
 *
 * This module is deliberately dependency-free and reads only `process.env`.
 * Nothing here may read the request, so a deployment hostname or an inbound
 * `Host` header can never become a canonical URL.
 */

export const SITE_NAME = "Inverge";

export const SITE_TAGLINE =
  "Milestone-escrowed crowdfunding and idea validation for African builders.";

export const SITE_DEFAULT_DESCRIPTION = SITE_TAGLINE;

/**
 * The homepage title. Child pages supply their own bare title and inherit the
 * root layout's `%s | Inverge` template, so no page repeats the site name.
 */
export const SITE_TITLE = `${SITE_NAME} — Milestone-escrowed crowdfunding`;

export const SITE_LOCALE = "en";

/**
 * The production origin used when `NEXT_PUBLIC_SITE_URL` is unset.
 *
 * A share preview must never resolve to a deployment hostname, so a build with
 * no configured origin still needs a stable value. Set `NEXT_PUBLIC_SITE_URL`
 * in the deployment environment to override this.
 */
export const FALLBACK_PRODUCTION_ORIGIN = "https://inverge.africa";

export const DEVELOPMENT_ORIGIN = "http://localhost:3000";

/**
 * Normalises a configured origin to `protocol://host`, or `null` when the
 * value is absent or unusable.
 *
 * Anything that is not a parseable http(s) URL is rejected rather than
 * coerced, so a typo in the environment cannot silently become a canonical
 * base.
 */
export function normalizeOrigin(raw: string | undefined): string | null {
  if (raw === undefined) return null;

  const trimmed = raw.trim();
  if (trimmed === "") return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  return url.origin;
}

/**
 * Resolves the canonical origin for the running environment.
 *
 * Precedence: a valid configured origin, then the production fallback in a
 * production build, then the local origin in development and test.
 */
export function resolveSiteOrigin({
  configured,
  nodeEnv,
}: {
  configured: string | undefined;
  nodeEnv: string;
}): string {
  const normalized = normalizeOrigin(configured);
  if (normalized !== null) return normalized;

  return nodeEnv === "production"
    ? FALLBACK_PRODUCTION_ORIGIN
    : DEVELOPMENT_ORIGIN;
}

export function siteOrigin(): string {
  return resolveSiteOrigin({
    configured: process.env.NEXT_PUBLIC_SITE_URL,
    nodeEnv: process.env.NODE_ENV ?? "development",
  });
}

/**
 * Builds an absolute URL for a site-relative path.
 *
 * A leading slash is enforced so a caller cannot produce a malformed path, and
 * the result always starts with the canonical origin.
 */
export function absoluteUrl(path: string): string {
  const trimmed = path.trim();
  const normalizedPath =
    trimmed === "" ? "/" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${siteOrigin()}${normalizedPath}`;
}

/**
 * The configured X/Twitter handle, without the `@`, or `null`.
 *
 * Never invented: the value is only returned when the deployment has set it, so
 * an unset variable produces no `twitter:site` tag rather than a guess.
 */
export function twitterSiteHandle(): string | null {
  const raw = process.env.NEXT_PUBLIC_TWITTER_HANDLE?.trim();
  if (raw === undefined || raw === "") return null;

  return raw.startsWith("@") ? raw : `@${raw}`;
}
