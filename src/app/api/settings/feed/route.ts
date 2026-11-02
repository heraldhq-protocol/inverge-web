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

const feedSchema = z.object({
  region: z.enum(["global", "africa", "west-africa"]),
  showPromoted: z.boolean(),
  topics: z.array(z.string().trim().min(1).max(40)).max(20),
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

  const parsed = feedSchema.safeParse(payload);
  if (!parsed.success) return invalidBodyResponse();

  const token = await requireApiToken(
    "Sign in again to save feed preferences.",
  );
  if (!token.ok) {
    return NextResponse.json(
      { error: { code: token.code, message: token.message } },
      { status: token.status },
    );
  }

  const result = await sendApiJson("/me/settings/feed", {
    body: parsed.data,
    method: "PUT",
    token: token.token,
  });
  if (!result.ok) return apiFailureResponse(result);

  return NextResponse.json({ feed: result.data });
}
