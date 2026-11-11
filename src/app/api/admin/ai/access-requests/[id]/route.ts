import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { decideAiAccess } from "@/features/admin/server/ai-access";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";

/** FR-901: authentication and authorization are enforced again by the write helper. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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
  const { id } = await context.params;
  const result = await decideAiAccess(id, body);
  if (!result.ok) return apiFailureResponse(result);
  revalidatePath("/admin/ai-access");
  return NextResponse.json(
    { mode: "live", request: result.request },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
