/**
 * Route → navigation-section matching for the product shell.
 *
 * Kept as a pure function because the rules are genuinely subtle: `/d/ideas`
 * owns creation and feedback configuration, `/d/ideas/[id]/insights` belongs to
 * Creator Studio, and the dashboard root prefixes every other dashboard route.
 * A prefix test alone would light up two items at once.
 */
export type NavigationHref = string;

/** True when `href`'s section owns `pathname`. */
export function isCurrentNavigationHref(
  pathname: string,
  href: NavigationHref,
): boolean {
  // The dashboard root is a prefix of everything, so it matches exactly.
  if (href === "/d") return pathname === "/d";

  // Creator Studio owns the analytics workspace, which is nested under the
  // authoring route for URL stability (the API scopes insights by idea id).
  if (href === "/d/creator") {
    return (
      pathname === "/d/creator" ||
      pathname.startsWith("/d/creator/") ||
      pathname.includes("/insights")
    );
  }

  if (href === "/d/ideas") {
    if (pathname.includes("/insights")) return false;
    return pathname === "/d/ideas" || pathname.startsWith("/d/ideas/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The mobile destinations, in order.
 *
 * Five, so every item keeps a comfortable touch target at 320px. Profile is not
 * here: it is reachable from the avatar in the header and from the account menu,
 * which keeps the bar about doing things rather than account housekeeping.
 */
export const MOBILE_NAV_HREFS = [
  "/d",
  "/d/discover",
  "/d/ideas/new",
  "/d/creator",
  "/d/notifications",
] as const satisfies readonly string[];

/** Creation is a destination, but its section highlight belongs to "My ideas". */
export function mobileSectionHref(href: string): string {
  return href === "/d/ideas/new" ? "/d/ideas" : href;
}
