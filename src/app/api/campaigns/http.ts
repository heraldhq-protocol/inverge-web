import { NextResponse } from "next/server";

import type { DraftApiFailure } from "@/features/campaigns/server/drafts";

/**
 * Forwards an API failure to the browser without losing the detail the editor
 * needs. A `409 STALE_DRAFT_VERSION` must arrive with `currentVersion`, and a
 * `400 CAMPAIGN_NOT_READY` with its blockers; flattening either into a generic
 * message would leave the creator with no way to fix the draft.
 */
export function draftFailureResponse(failure: DraftApiFailure) {
  return NextResponse.json(
    {
      error: {
        code: failure.code,
        message: failure.message,
        ...(failure.details === undefined ? {} : { details: failure.details }),
      },
    },
    { status: failure.status },
  );
}

export function draftInvalidBodyResponse() {
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
