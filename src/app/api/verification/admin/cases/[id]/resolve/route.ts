import { NextResponse } from "next/server";

import { verificationResponse } from "@/app/api/verification/http";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { resolveRisk } from "@/features/verification/server/api";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    decision?: "CLEAR" | "CONFIRM_MATCH";
    reasonCode?: string;
    reason?: string;
  } | null;
  if (
    (body?.decision !== "CLEAR" && body?.decision !== "CONFIRM_MATCH") ||
    !body.reasonCode?.trim() ||
    !body.reason?.trim()
  ) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "A decision, reason code and reason are required.",
        },
      },
      { status: 400 },
    );
  }
  return verificationResponse(
    await resolveRisk(id, {
      decision: body.decision,
      reason: body.reason.trim(),
      reasonCode: body.reasonCode.trim(),
    }),
  );
}
