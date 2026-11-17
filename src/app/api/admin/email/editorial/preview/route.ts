import { NextResponse } from "next/server";

import { previewEditorialEmail } from "@/features/admin/server/editorial-email";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return apiFailureResponse({
      ok: false,
      status: 403,
      code: "ORIGIN_NOT_ALLOWED",
      message: "Cross-site request refused.",
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }

  const result = await previewEditorialEmail(body);
  if (!result.ok) {
    return apiFailureResponse(result);
  }

  return NextResponse.json(
    { ok: true, preview: result.preview },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
