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

const requestSchema = z.object({
  email: z.string().trim().min(3).max(254),
});

export async function POST(request: Request) {
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

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return invalidBodyResponse();

  const token = await requireApiToken("Sign in again to verify your email.");
  if (!token.ok) {
    return NextResponse.json(
      { error: { code: token.code, message: token.message } },
      { status: token.status },
    );
  }

  const result = await sendApiJson("/auth/email/request", {
    body: parsed.data,
    method: "POST",
    token: token.token,
  });
  if (!result.ok) return apiFailureResponse(result);

  return NextResponse.json(result.data);
}
