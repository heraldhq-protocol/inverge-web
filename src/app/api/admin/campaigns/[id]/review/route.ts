import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isSameOriginRequest } from "@/features/auth/server/origin";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import { reviewRequestSchema } from "@/features/campaigns/lib/admin-campaign-review";
import { submitAdminCampaignReview } from "@/features/campaigns/server/admin-campaigns";
import {
  apiFailureResponse,
  invalidJsonBodyResponse,
  previewAuthResponse,
} from "@/lib/api/route";

const actions = {
  approve: "APPROVE",
  "request-changes": "REQUEST_CHANGES",
  reject: "REJECT",
  APPROVE: "APPROVE",
  REQUEST_CHANGES: "REQUEST_CHANGES",
  REJECT: "REJECT",
} as const;
const requestSchema = z
  .object({
    action: z
      .enum([
        "approve",
        "request-changes",
        "reject",
        "APPROVE",
        "REQUEST_CHANGES",
        "REJECT",
      ])
      .transform((value) => actions[value]),
    reason: z.string().optional(),
  })
  .pipe(reviewRequestSchema);

// FR-901: the HttpOnly session and admin role are rechecked for every mutation.
export async function POST(
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
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) {
    return apiFailureResponse({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: access.reason,
    });
  }
  // Preview decisions are local and never reach this write boundary.
  if (access.preview) return previewAuthResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return apiFailureResponse({
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message:
        parsed.error.issues[0]?.message ??
        "A valid review decision is required.",
    });
  }

  const { id } = await context.params;
  const result = await submitAdminCampaignReview(id, parsed.data);
  if (!result.ok) return apiFailureResponse(result);

  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/campaigns/${id}`);
  return NextResponse.json({ mode: "live", decision: result.data });
}
