import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { decideAnalyticsAccess } from "@/features/admin/server/analytics-access";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";

/** FR-901: the helper rechecks a live admin session for each decision. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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
  const { id } = await context.params;
  const result = await decideAnalyticsAccess(id, body);
  if (!result.ok) return apiFailureResponse(result);
  revalidatePath("/admin/analytics-access");
  return NextResponse.json(
    { mode: "live", request: result.request },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
