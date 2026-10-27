import { NextResponse } from "next/server";

import { verificationResponse } from "@/app/api/verification/http";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { startVerificationSession } from "@/features/verification/server/api";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as {
    purpose?: "IDEA_VALIDATION" | "CAMPAIGN_CREATOR" | "BACKER_THRESHOLD";
    subject?: "INDIVIDUAL" | "BUSINESS";
  };
  return verificationResponse(
    await startVerificationSession({
      ...(body.purpose === undefined ? {} : { purpose: body.purpose }),
      ...(body.subject === undefined ? {} : { subject: body.subject }),
    }),
  );
}
