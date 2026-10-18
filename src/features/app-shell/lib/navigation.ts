/**
 * Route → navigation-section matching for the product shell.
 *
 * Kept as a pure function because the rules are genuinely subtle: everything a
 * creator owns lives under `/d/creator` (D-017), but the sidebar shows both
 * "Creator Studio" and "My ideas", and per-idea analytics belong to the Studio
 * highlight rather than to the list. A prefix test alone would light up two
 * items at once.
 */
export type NavigationHref = string;

/** True when `href`'s section owns `pathname`. */
export function isCurrentNavigationHref(
  pathname: string,
  href: NavigationHref,
): boolean {
  // The dashboard root is a prefix of everything, so it matches exactly.
  if (href === "/d") return pathname === "/d";

  // My ideas owns creation, the per-idea workspace, and feedback setup - every
  // idea-authored route except analytics.
  if (href === "/d/creator/ideas") {
    if (pathname.includes("/insights")) return false;
    return (
      pathname === "/d/creator/ideas" ||
      pathname.startsWith("/d/creator/ideas/")
    );
  }

  // Creator Studio owns its overview, the feedback inbox, the analytics home,
  // and the per-idea analytics workspace, but not the idea list or the campaign
  // list, which each carry their own sidebar item.
  if (href === "/d/creator") {
    if (pathname === "/d/creator" || pathname.includes("/insights")) {
      return true;
    }
    return (
      pathname.startsWith("/d/creator/") &&
      !pathname.startsWith("/d/creator/ideas") &&
      !pathname.startsWith("/d/creator/campaigns")
    );
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
  "/d/creator/ideas/new",
  "/d/creator",
  "/d/notifications",
] as const satisfies readonly string[];

/** Creation is a destination, but its section highlight belongs to "My ideas". */
export function mobileSectionHref(href: string): string {
  return href === "/d/creator/ideas/new" ? "/d/creator/ideas" : href;
}
