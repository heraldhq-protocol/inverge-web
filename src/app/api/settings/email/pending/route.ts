import { NextResponse } from "next/server";

import { requireApiToken } from "@/features/auth/server/api-token";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  apiFailureResponse,
  previewModeResponse,
} from "@/features/settings/server/bff";
import { sendApiJson } from "@/lib/api/server";

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }
  if (isPreviewAuth()) return previewModeResponse();

  const token = await requireApiToken("Sign in again to cancel the change.");
  if (!token.ok) {
    return NextResponse.json(
      { error: { code: token.code, message: token.message } },
      { status: token.status },
    );
  }

  const result = await sendApiJson("/auth/email/pending", {
    method: "DELETE",
    token: token.token,
  });
  if (!result.ok) return apiFailureResponse(result);

  return NextResponse.json(result.data);
}
