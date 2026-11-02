import "server-only";

import { NextResponse } from "next/server";

import type { ApiWriteResult } from "@/lib/api/server";

export function invalidBodyResponse(): NextResponse {
  return NextResponse.json(
    { error: { code: "INVALID_BODY", message: "Check the submitted values." } },
    { status: 400 },
  );
}

export function previewModeResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "PREVIEW_MODE",
        message:
          "This is a local preview session. Sign in to a live account to save settings.",
      },
    },
    { status: 409 },
  );
}

export function sessionRequiredResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "NOT_SIGNED_IN",
        message: "Sign in again to save settings.",
      },
    },
    { status: 401 },
  );
}

/**
 * Forwards the API's own status and message. A route never flattens a 409, 429
 * or 422 into a generic failure, because the form needs the real reason.
 */
export function apiFailureResponse(
  result: Extract<ApiWriteResult, { ok: false }>,
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: result.code,
        message: result.message,
        ...(result.details !== undefined ? { details: result.details } : {}),
      },
    },
    {
      status:
        result.status >= 400 && result.status <= 599 ? result.status : 502,
    },
  );
}
