/**
 * Adds the "reopen the composer" hint to a return destination.
 *
 * The hint is a query parameter rather than component state because the visitor
 * leaves the page for sign-in. It carries no content and no identity: after the
 * return the composer is focused, and nothing is posted automatically.
 *
 * The caller has already passed the path through `safeReturnPath`; this function
 * still preserves only path, query and fragment, so it cannot turn into an
 * absolute or protocol-relative URL.
 */
export function withComposeIntent(returnPath: string): string {
  const base = "https://inverge.local";
  let url: URL;

  try {
    url = new URL(returnPath, base);
  } catch {
    return returnPath.startsWith("/") ? returnPath : "/";
  }

  if (url.origin !== base) return "/";

  url.searchParams.set("compose", "1");
  return `${url.pathname}${url.search}${url.hash}`;
}

/** The composer hint this page was opened with, if any. */
export function hasComposeIntent(search: string): boolean {
  try {
    return new URLSearchParams(search).get("compose") === "1";
  } catch {
    return false;
  }
}
