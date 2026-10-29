import { NextResponse } from "next/server";

import {
  draftFailureResponse,
  draftInvalidBodyResponse,
} from "@/app/api/campaigns/http";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  campaignDraftToken,
  submitCampaignDraft,
} from "@/features/campaigns/server/drafts";

type RouteContext = { params: Promise<{ campaignId: string }> };

function submitBody(
  value: unknown,
): { applicationFeeChargeId?: string } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  const raw = record.applicationFeeChargeId;
  if (raw === undefined) return {};
  if (typeof raw !== "string" || raw.trim().length === 0) return null;

  return { applicationFeeChargeId: raw.trim() };
}

/**
 * Submits a saved draft for curation review.
 *
 * The browser may name the charge it believes it paid. The API still verifies
 * that the charge exists, belongs to this creator, is an `APPLICATION_FEE`, is
 * `SUCCEEDED`, and is bound to this campaign before it changes state. Nothing
 * trusted is derived here.
 */
export async function POST(request: Request, context: RouteContext) {
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
            "Preview sign-in has no backend account. Sign in with the API to submit a campaign.",
        },
      },
      { status: 503 },
    );
  }

  const auth = await campaignDraftToken();
  if (!auth.ok) return draftFailureResponse(auth);

  const text = await request.text();
  let parsed: unknown = {};
  if (text.trim().length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      return draftInvalidBodyResponse();
    }
  }

  const body = submitBody(parsed);
  if (!body) return draftInvalidBodyResponse();

  const { campaignId } = await context.params;
  const result = await submitCampaignDraft(auth.token, campaignId, body);
  if (!result.ok) return draftFailureResponse(result);

  return NextResponse.json(result.data, { status: result.status });
}
