import { NextResponse } from "next/server";

import { verificationResponse } from "@/app/api/verification/http";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { setAccountType } from "@/features/verification/server/api";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    accountType?: "INDIVIDUAL" | "BUSINESS";
  } | null;
  if (body?.accountType !== "INDIVIDUAL" && body?.accountType !== "BUSINESS") {
    return NextResponse.json(
      { error: { code: "INVALID_BODY" } },
      { status: 400 },
    );
  }
  return verificationResponse(await setAccountType(body.accountType));
}
