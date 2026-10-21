import { NextResponse } from "next/server";

import { isSameOriginRequest } from "@/features/auth/server/origin";
import { clearPreviewSession } from "@/features/auth/server/preview-session";
import {
  clearOnboardingIntent,
  clearSessionCookie,
} from "@/features/auth/server/session";

/**
 * Clears the Inverge session cookie.
 *
 * The provider session lives in the browser, so it is ended separately by the
 * sign-out page before this is called. This endpoint only owns the cookie it
 * created; it is deliberately idempotent so a retry is harmless.
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }

  await clearSessionCookie();
  await clearPreviewSession();
  // The onboarding hint belongs to the session it was captured for.
  await clearOnboardingIntent();

  return new NextResponse(null, { status: 204 });
}
