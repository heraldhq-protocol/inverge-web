import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isSameOriginRequest } from "@/features/auth/server/origin";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  submitAdminCampaignReview,
  type AdminReviewAction,
} from "@/features/campaigns/server/admin-campaigns";
import { isApiConfigured } from "@/lib/api/server";

const reviewSchema = z.object({
  action: z.enum(["approve", "request-changes", "reject", "APPROVE", "REQUEST_CHANGES", "REJECT"]),
  reason: z.string().trim().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeAction(action: string): AdminReviewAction {
  switch (action.toLowerCase()) {
    case "approve":
      return "APPROVE";
    case "request-changes":
    case "request_changes":
      return "REQUEST_CHANGES";
    case "reject":
      return "REJECT";
    default:
      return "APPROVE";
  }
}

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED", message: "Cross-site request refused." } },
      { status: 403 },
    );
  }

  const access = await getProgrammeAdminAccess();
  if (!access.allowed) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: access.reason } },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "Malformed JSON body." } },
      { status: 400 },
    );
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "A valid decision action (approve, request-changes, reject) is required.",
        },
      },
      { status: 422 },
    );
  }

  const { id } = await context.params;
  const action = normalizeAction(parsed.data.action);
  const reason = parsed.data.reason;

  if ((action === "REQUEST_CHANGES" || action === "REJECT") && (!reason || reason.length < 20)) {
    return NextResponse.json(
      {
        error: {
          code: "REASON_REQUIRED",
          message: "A specific reason of at least 20 characters is required for this decision.",
        },
      },
      { status: 422 },
    );
  }

  // Handle preview mode or unconfigured API gracefully
  if (access.preview || !isApiConfigured()) {
    revalidatePath("/admin/campaigns");
    revalidatePath(`/admin/campaigns/${id}`);
    return NextResponse.json({
      ok: true,
      data: {
        preview: true,
        action,
        decidedAt: new Date().toISOString(),
        message: "Decision recorded locally in preview mode.",
      },
    });
  }

  const result = await submitAdminCampaignReview(id, {
    action,
    reason,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: result.code,
          message: result.message,
          details: result.details,
        },
      },
      { status: result.status },
    );
  }

  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/campaigns/${id}`);

  return NextResponse.json({
    ok: true,
    data: result.data,
  });
}
