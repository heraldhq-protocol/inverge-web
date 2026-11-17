import { NextResponse } from "next/server";

import { screenAml } from "@/features/admin/server/aml";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";

/**
 * FR-103 / FR-104 / NFR-19: run an AML screen as the authenticated admin and
 * return only a confirmed, non-cacheable result. The screening is recorded by
 * the service; this route never presents it as an account decision.
 */
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
  const result = await screenAml(body);
  if (!result.ok) return apiFailureResponse(result);
  return NextResponse.json(
    {
      mode: "live",
      kind: result.kind,
      userId: result.userId,
      result: result.result,
    },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
