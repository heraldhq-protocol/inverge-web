import { NextResponse } from "next/server";

import { verificationResponse } from "@/app/api/verification/http";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { startBusinessVerification } from "@/features/verification/server/api";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED" } },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    legalName?: string;
    registrationNumber?: string;
    country?: string;
    businessType?: string;
    registeredAddress?: string;
    representativeName?: string;
    representativeRole?: string;
  } | null;
  if (!body?.legalName || body.legalName.trim().length < 2) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "A registered legal name is required.",
        },
      },
      { status: 400 },
    );
  }
  return verificationResponse(
    await startBusinessVerification({
      ...body,
      legalName: body.legalName.trim(),
    }),
  );
}
