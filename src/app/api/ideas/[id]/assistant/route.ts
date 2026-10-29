import { NextResponse } from "next/server";

import { forwardIdeaWrite } from "@/features/idea-builder/server/forward";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Asks the assistant for a proposal on one idea field. The API owns ownership,
 * entitlement, quota and output validation; this route only carries the session
 * and forwards the answer. It never writes to the idea.
 */
export async function POST(request: Request, context: RouteContext) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
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

  const { id } = await context.params;
  return forwardIdeaWrite(request, {
    body,
    method: "POST",
    path: `/ideas/${encodeURIComponent(id)}/assistant`,
    timeoutMs: 35_000,
  });
}
