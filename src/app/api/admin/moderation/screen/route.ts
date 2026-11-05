import { NextResponse } from "next/server";

import { screenContent } from "@/features/admin/server/moderation";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";

/** FR-901 / NFR-14: screen text as the authenticated admin, without a listing write. */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return apiFailureResponse({
      ok: false,
      status: 403,
      code: "ORIGIN_NOT_ALLOWED",
      message: "Cross-site request refused.",
    });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }
  const result = await screenContent(body);
  if (!result.ok) return apiFailureResponse(result);
  return NextResponse.json(
    { mode: "live", screening: result.screening },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
