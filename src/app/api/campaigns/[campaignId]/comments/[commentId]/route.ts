import { NextResponse } from "next/server";

import { originRefused } from "@/app/api/discussions/http";
import { requireApiToken } from "@/features/auth/server/api-token";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { deleteDiscussionComment } from "@/features/discussions/server/comments-api";
import { apiFailureResponse, previewAuthResponse } from "@/lib/api/route";

type RouteContext = {
  params: Promise<{ campaignId: string; commentId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return originRefused();
  if (isPreviewAuth()) return previewAuthResponse();

  const auth = await requireApiToken("Sign in before deleting a comment.");
  if (!auth.ok) return apiFailureResponse(auth);

  const { campaignId, commentId } = await context.params;
  const result = await deleteDiscussionComment(
    `/campaigns/${encodeURIComponent(campaignId)}/comments`,
    auth.token,
    commentId,
  );
  if (!result.ok) return apiFailureResponse(result);

  return NextResponse.json({ deleted: true });
}
