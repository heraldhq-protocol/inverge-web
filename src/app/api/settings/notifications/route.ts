import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiToken } from "@/features/auth/server/api-token";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  apiFailureResponse,
  invalidBodyResponse,
  previewModeResponse,
} from "@/features/settings/server/bff";
import { sendApiJson } from "@/lib/api/server";

const notificationSchema = z.object({
  creatorUpdates: z.boolean(),
  discoveryDigest: z.boolean(),
  emailUpdates: z.boolean(),
  milestoneReviews: z.boolean(),
});

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }
  if (isPreviewAuth()) return previewModeResponse();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidBodyResponse();
  }

  const parsed = notificationSchema.safeParse(payload);
  if (!parsed.success) return invalidBodyResponse();

  const token = await requireApiToken(
    "Sign in again to save notification preferences.",
  );
  if (!token.ok) {
    return NextResponse.json(
      { error: { code: token.code, message: token.message } },
      { status: token.status },
    );
  }

  const result = await sendApiJson("/me/settings/notifications", {
    body: parsed.data,
    method: "PUT",
    token: token.token,
  });
  if (!result.ok) return apiFailureResponse(result);

  return NextResponse.json({ notifications: result.data });
}
