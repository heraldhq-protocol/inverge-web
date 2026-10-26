import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/features/auth/lib/cookies";
import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_MAX_AGE_SECONDS,
} from "@/features/analytics/lib/session";

/**
 * Gives an anonymous reader one short-lived, first-party session id.
 *
 * The id is random, opaque, and expires with the reading session. It is never
 * derived from an address, a user agent, or anything the client can choose. A
 * signed-in reader already has an account identity, so no visitor cookie is
 * minted for them; the server-side ingest uses the internal user id instead.
 */
export function proxy(request: NextRequest): NextResponse {
  if (process.env.INVERGE_ANALYTICS_ENABLED !== "true") return NextResponse.next();

  const hasAccountSession = request.cookies.has(SESSION_COOKIE_NAME);
  const hasVisitorSession = request.cookies.has(ANALYTICS_SESSION_COOKIE);
  if (hasAccountSession || hasVisitorSession) return NextResponse.next();

  const visitorId = crypto.randomUUID();
  // Forward the id on this request as well as setting it on the response. The
  // page's post-response producer reads `cookies()` during the same request; a
  // response-only cookie would silently drop every reader's first page view.
  request.cookies.set(ANALYTICS_SESSION_COOKIE, visitorId);
  const response = NextResponse.next({ request });
  response.cookies.set(ANALYTICS_SESSION_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ANALYTICS_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
