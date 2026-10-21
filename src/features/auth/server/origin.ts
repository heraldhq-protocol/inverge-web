import "server-only";

/**
 * Guards the session endpoints against a cross-site browser request.
 *
 * The exchange endpoint is not authenticated by the cookie, so CSRF here is
 * login CSRF: another site could POST its own provider token and leave the
 * visitor silently signed in as the attacker. Requiring an `Origin` header that
 * matches this app rejects that request, and browsers always send `Origin` on a
 * cross-origin POST.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    // `Origin: null` (sandboxed iframe, some redirects) is not same-origin.
    return false;
  }
}
