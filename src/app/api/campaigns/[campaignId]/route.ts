import { NextResponse } from "next/server";

import {
  draftFailureResponse,
  draftInvalidBodyResponse,
} from "@/app/api/campaigns/http";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  campaignDraftToken,
  updateCampaignDraft,
} from "@/features/campaigns/server/drafts";

type RouteContext = { params: Promise<{ campaignId: string }> };

/**
 * Saves one version of a draft.
 *
 * The body must carry the `version` it was read from. The API applies it with
 * optimistic concurrency and answers `409 STALE_DRAFT_VERSION` when another tab
 * saved first; this route passes that conflict through untouched, including the
 * current version the editor needs to explain the conflict.
 */
export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      {
        error: {
          code: "ORIGIN_NOT_ALLOWED",
          message: "Cross-origin request refused.",
        },
      },
      { status: 403 },
    );
  }

  if (isPreviewAuth()) {
    return NextResponse.json(
      {
        error: {
          code: "API_REQUIRED",
          message:
            "Preview sign-in has no backend account. Sign in with the API to save a draft.",
        },
      },
      { status: 503 },
    );
  }

  const auth = await campaignDraftToken();
  if (!auth.ok) return draftFailureResponse(auth);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return draftInvalidBodyResponse();
  }

  const { campaignId } = await context.params;
  const result = await updateCampaignDraft(auth.token, campaignId, body);
  if (!result.ok) return draftFailureResponse(result);

  return NextResponse.json(result.data, { status: 200 });
}
