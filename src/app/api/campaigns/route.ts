import { NextResponse } from "next/server";

import {
  draftFailureResponse,
  draftInvalidBodyResponse,
} from "@/app/api/campaigns/http";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  campaignDraftToken,
  createCampaignDraft,
} from "@/features/campaigns/server/drafts";

/**
 * Creates the creator's persistent campaign draft.
 *
 * Everything trusted — status, review state, terms hash, deployment and fee
 * state — is derived by the API. This route forwards the authored document and
 * the API's answer, including a validation error, unchanged.
 *
 * A cross-site POST is refused: the call carries the session cookie, so it is a
 * state-changing request that must come from this origin.
 */
export async function POST(request: Request) {
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

  const result = await createCampaignDraft(auth.token, body);
  if (!result.ok) return draftFailureResponse(result);

  return NextResponse.json(result.data, { status: 201 });
}
