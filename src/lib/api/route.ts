import { NextResponse } from "next/server";

import type { ApiWriteFailure } from "@/lib/api/server";

/**
 * Forwards an API failure to the browser without losing the detail the editor
 * needs. A `FUNDING_REQUIRES_ROADMAP` must arrive with its blockers and an
 * `AI_ENTITLEMENT_REQUIRED` with the request status; flattening either into a
 * generic message would leave the creator with no way forward.
 *
 * A status below 400 (or above 599) cannot be sent as an HTTP response; those
 * become 502 rather than crashing the route.
 */
export function apiFailureResponse(failure: ApiWriteFailure) {
  const status =
    failure.status >= 400 && failure.status <= 599 ? failure.status : 502;

  return NextResponse.json(
    {
      error: {
        code: failure.code,
        message: failure.message,
        ...(failure.details === undefined ? {} : { details: failure.details }),
      },
    },
    { status },
  );
}

export function invalidJsonBodyResponse() {
  return NextResponse.json(
    {
      error: {
        code: "INVALID_BODY",
        message: "The request body is not valid JSON.",
      },
    },
    { status: 400 },
  );
}

export function previewAuthResponse() {
  return NextResponse.json(
    {
      error: {
        code: "API_REQUIRED",
        message:
          "Preview sign-in has no backend account. Sign in with the API to use this feature.",
      },
    },
    { status: 503 },
  );
}
