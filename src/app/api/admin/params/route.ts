import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  getPlatformParams,
  updatePlatformParams,
} from "@/features/admin/server/params";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";

export async function GET() {
  const result = await getPlatformParams();
  if (result.status !== "ready") {
    return NextResponse.json(
      {
        ok: false,
        status: 503,
        code: "UNAVAILABLE",
        message: result.message,
      },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  return NextResponse.json(
    { ok: true, params: result.data },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

export async function PATCH(request: Request) {
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

  const result = await updatePlatformParams(body);
  if (!result.ok) {
    return apiFailureResponse(result);
  }

  revalidatePath("/admin/params");
  return NextResponse.json(
    { ok: true, params: result.params },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
