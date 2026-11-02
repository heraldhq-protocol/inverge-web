import {
  DEFAULT_ONBOARDING_INTENT,
  EMAIL_VERIFICATION_PATH,
  type OnboardingIntent,
} from "@/features/auth/lib/onboarding";

/**
 * The one route that can create a session.
 *
 * `/sign-in` and `/sign-up` are permanent redirects to this path (D-034), so
 * every new link should point here directly rather than rely on the redirect.
 */
export const AUTH_PATH = "/auth";

/** Ends the browser's provider session and clears the Inverge session cookie. */
export const SIGN_OUT_PATH = "/sign-out";

const DEFAULT_RETURN_PATH = "/d";

/**
 * Turns an untrusted `?next=` value into a path the app may redirect to.
 *
 * Only a same-site absolute path is allowed. A protocol-relative value
 * (`//evil.test`), an absolute URL, a backslash (which some URL parsers treat as
 * a slash), an encoded separator, or a control character would turn the return
 * link into an open redirect, so each is dropped in favour of the dashboard.
 * The value is parsed against a fixed origin and only its path, query and
 * fragment are returned, so a crafted scheme cannot survive normalisation.
 */
export function safeReturnPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) return DEFAULT_RETURN_PATH;
  if (!candidate.startsWith("/")) return DEFAULT_RETURN_PATH;
  if (candidate.startsWith("//")) return DEFAULT_RETURN_PATH;
  if (candidate.includes("\\")) return DEFAULT_RETURN_PATH;
  // Control characters are rejected: some URL parsers strip them.
  if (/[\u0000-\u001f\u007f]/.test(candidate)) return DEFAULT_RETURN_PATH;

  // One decode catches `%2F%2Fevil.test`, `%5Cevil.test` and encoded control
  // characters before a downstream proxy can decode them into a redirect.
  let decoded: string;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return DEFAULT_RETURN_PATH;
  }
  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return DEFAULT_RETURN_PATH;
  }

  let url: URL;
  try {
    url = new URL(candidate, "https://inverge.local");
  } catch {
    return DEFAULT_RETURN_PATH;
  }
  if (url.origin !== "https://inverge.local" || !url.pathname.startsWith("/")) {
    return DEFAULT_RETURN_PATH;
  }

  // Returning to the sign-in or sign-out page would bounce the visitor between
  // that page and its own redirect.
  if (
    url.pathname === AUTH_PATH ||
    url.pathname === EMAIL_VERIFICATION_PATH ||
    url.pathname === SIGN_OUT_PATH
  ) {
    return DEFAULT_RETURN_PATH;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * A link to the sign-in page that remembers where the visitor was going and
 * which door they came through. Defaults are omitted so the URL stays clean.
 */
export function authHref(
  nextPath?: string,
  intent: OnboardingIntent = DEFAULT_ONBOARDING_INTENT,
): string {
  const params = new URLSearchParams();
  const returnPath = safeReturnPath(nextPath);

  if (nextPath && returnPath !== DEFAULT_RETURN_PATH) {
    params.set("next", returnPath);
  }
  if (intent === "creator") params.set("intent", "creator");

  const query = params.toString();
  return query ? `${AUTH_PATH}?${query}` : AUTH_PATH;
}
