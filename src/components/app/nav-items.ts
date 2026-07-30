// The app shell's nav, defined once and consumed by both the sidebar and the mobile drawer so the
// two can never drift (app-mockup-kit §5: the chrome is identical on every logged-in screen).
//
// Deliberately only routes that exist. "Receipts" and "Settings" are named in the mockup kit but
// have no route until Phase 2, and shipping nav that 404s is worse than shipping a shorter nav.
// "My ideas" joins this list with the creator dashboard (brief §8, stage 7).

export type AppNavItem = {
  href: string;
  label: string;
  /** Marks the item active for its own path and anything nested under it. */
  match: (pathname: string) => boolean;
};

const startsWith = (prefix: string) => (pathname: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const APP_NAV: AppNavItem[] = [
  { href: '/feed', label: 'Discover', match: (p) => startsWith('/feed')(p) || startsWith('/ideas')(p) },
  { href: '/campaigns', label: 'Campaigns', match: startsWith('/campaigns') },
  { href: '/verify', label: 'Verification', match: startsWith('/verify') },
];

/** Top-bar breadcrumb labels. Falls back to the humanised last segment. */
const CRUMBS: Record<string, string> = {
  '/feed': 'Discover',
  '/ideas': 'Discover',
  '/ideas/new': 'Publish an idea',
  '/campaigns': 'Campaigns',
  '/verify': 'Verification',
  '/review': 'Curation queue',
};

export function crumbFor(pathname: string): string {
  if (CRUMBS[pathname]) return CRUMBS[pathname];
  // Nested detail routes: label by their parent section rather than by an opaque id.
  if (pathname.startsWith('/ideas/')) return 'Idea';
  if (pathname.startsWith('/campaigns/')) return 'Campaign';
  return 'Inverge';
}
