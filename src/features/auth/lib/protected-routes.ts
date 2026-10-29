import { authHref } from "@/features/auth/lib/auth-routes";

/**
 * Routes that require an account session before their layout renders.
 *
 * The proxy uses this list for an early redirect. It is not the security
 * boundary: the dashboard layout and the admin layout re-read the session
 * server-side and decide again. Keeping the list here means the early redirect
 * and the route's own gate cannot drift apart.
 */
export const PROTECTED_PREFIXES = ["/d", "/admin"] as const;

/** The request header the proxy writes so a layout can preserve a return path. */
export const PATHNAME_HEADER = "x-inverge-pathname";

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * The sign-in URL for a protected path, preserving the full path and query.
 * `authHref` sanitises the return value and drops unsafe destinations.
 */
export function signInHrefFor(pathname: string, search = ""): string {
  return authHref(`${pathname}${search}`);
}
