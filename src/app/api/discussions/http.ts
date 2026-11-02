import { NextResponse } from "next/server";
import { z } from "zod";

import { apiFailureResponse } from "@/lib/api/route";
import { ApiRequestError } from "@/lib/api/server";

/** The body a discussion create accepts, for both entity kinds. */
export const discussionCreateSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

/** Reads a bounded opaque cursor from a list request. */
export function discussionCursorFrom(request: Request): string | null {
  const value = new URL(request.url).searchParams.get("cursor")?.trim();
  return value ? value.slice(0, 2048) : null;
}

export function originRefused() {
  return NextResponse.json(
    {
      error: {
        code: "ORIGIN_NOT_ALLOWED",
        message: "Cross-origin request refused.",
      },
    },
    { status: 403 },
  );
}

export function invalidDiscussionBody() {
  return NextResponse.json(
    {
      error: {
        code: "INVALID_BODY",
        message: "A comment needs between 1 and 2000 characters.",
      },
    },
    { status: 400 },
  );
}

/**
 * Forwards an API read failure without flattening the status. A 404 keeps its
 * 404 so the page can treat a non-public thread as missing, and an outage
 * becomes a 503 the caller can offer to retry.
 */
export function discussionUpstreamFailure(error: unknown) {
  if (error instanceof ApiRequestError) {
    return apiFailureResponse({
      code: error.code,
      message: error.message,
      ok: false,
      status: error.status,
    });
  }
  return apiFailureResponse({
    code: "API_UNREACHABLE",
    message: "The discussion could not be loaded right now.",
    ok: false,
    status: 503,
  });
}
