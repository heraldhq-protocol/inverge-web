import { NextResponse } from "next/server";

import {
  discussionCreateSchema,
  discussionCursorFrom,
  discussionUpstreamFailure,
  invalidDiscussionBody,
  originRefused,
} from "@/app/api/discussions/http";
import { requireApiToken } from "@/features/auth/server/api-token";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  createDiscussionComment,
  DISCUSSION_PAGE_SIZE,
} from "@/features/discussions/server/comments-api";
import {
  apiFailureResponse,
  invalidJsonBodyResponse,
  previewAuthResponse,
} from "@/lib/api/route";
import { fetchApiJson } from "@/lib/api/server";

type RouteContext = { params: Promise<{ campaignId: string }> };

/** Public read of a campaign discussion. A non-public campaign answers 404. */
export async function GET(request: Request, context: RouteContext) {
  const { campaignId } = await context.params;
  const params = new URLSearchParams({ limit: String(DISCUSSION_PAGE_SIZE) });
  const cursor = discussionCursorFrom(request);
  if (cursor) params.set("cursor", cursor);

  try {
    const page = await fetchApiJson(
      `/campaigns/${encodeURIComponent(campaignId)}/comments?${params.toString()}`,
    );
    return NextResponse.json(page);
  } catch (error) {
    return discussionUpstreamFailure(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return originRefused();
  if (isPreviewAuth()) return previewAuthResponse();

  const auth = await requireApiToken("Sign in before commenting.");
  if (!auth.ok) return apiFailureResponse(auth);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }

  const parsed = discussionCreateSchema.safeParse(payload);
  if (!parsed.success) return invalidDiscussionBody();

  const { campaignId } = await context.params;
  const result = await createDiscussionComment(
    `/campaigns/${encodeURIComponent(campaignId)}/comments`,
    auth.token,
    parsed.data.body,
  );
  if (!result.ok) return apiFailureResponse(result);

  return NextResponse.json(result.comment, { status: 201 });
}
