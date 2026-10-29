import { NextResponse, type NextRequest } from "next/server";

import {
  PREVIEW_SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/features/auth/lib/cookies";
import {
  isProtectedPath,
  PATHNAME_HEADER,
  signInHrefFor,
} from "@/features/auth/lib/protected-routes";
import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_MAX_AGE_SECONDS,
} from "@/features/analytics/lib/session";

/**
 * Early redirect for private routes, plus the anonymous analytics session.
 *
 * The redirect only checks that a session cookie exists. A forged or expired
 * cookie still reaches the route, where the server layout exchanges it for
 * `/auth/me` and redirects if the API rejects it. This is a fast path, not the
 * authorisation decision.
 */
function hasSession(request: NextRequest): boolean {
  if (request.cookies.has(SESSION_COOKIE_NAME)) return true;

  const previewEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.INVERGE_AUTH_MODE === "preview";
  return previewEnabled && request.cookies.has(PREVIEW_SESSION_COOKIE_NAME);
}

/**
 * Gives an anonymous reader one short-lived, first-party session id.
 *
 * The id is random, opaque, and expires with the reading session. It is never
 * derived from an address, a user agent, or anything the client can choose. A
 * signed-in reader already has an account identity, so no visitor cookie is
 * minted for them; the server-side ingest uses the internal user id instead.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (isProtectedPath(pathname) && !hasSession(request)) {
    return NextResponse.redirect(
      new URL(signInHrefFor(pathname, search), request.url),
    );
  }

  let visitorId: string | null = null;

  if (process.env.INVERGE_ANALYTICS_ENABLED === "true") {
    const hasAccountSession = request.cookies.has(SESSION_COOKIE_NAME);
    const hasVisitorSession = request.cookies.has(ANALYTICS_SESSION_COOKIE);

    if (!hasAccountSession && !hasVisitorSession) {
      visitorId = crypto.randomUUID();
      // Forward the id on this request as well as setting it on the response.
      // The page's post-response producer reads `cookies()` during the same
      // request; a response-only cookie would silently drop every reader's
      // first page view.
      request.cookies.set(ANALYTICS_SESSION_COOKIE, visitorId);
    }
  }

  // A client may send its own copy of this header; overwrite it so a layout
  // never trusts a path the proxy did not observe. Mutate the request rather
  // than a clone so the analytics cookie set above is forwarded with it.
  request.headers.set(PATHNAME_HEADER, `${pathname}${search}`);

  const response = NextResponse.next({ request });

  if (visitorId) {
    response.cookies.set(ANALYTICS_SESSION_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ANALYTICS_SESSION_MAX_AGE_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
