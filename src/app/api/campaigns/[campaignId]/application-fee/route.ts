import { NextResponse } from "next/server";

import { draftFailureResponse } from "@/app/api/campaigns/http";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  campaignDraftToken,
  createApplicationFeeCharge,
} from "@/features/campaigns/server/drafts";

type RouteContext = { params: Promise<{ campaignId: string }> };

/**
 * Starts or resumes the application-fee checkout for one draft.
 *
 * The API owns idempotency: a pending charge returns the existing checkout URL
 * rather than creating a second non-refundable charge. This route only adds the
 * session and the same-origin check; it never accepts an amount or a provider
 * reference from the browser.
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
            "Preview sign-in has no backend account. Sign in with the API to pay the application fee.",
        },
      },
      { status: 503 },
    );
  }

  const auth = await campaignDraftToken();
  if (!auth.ok) return draftFailureResponse(auth);

  const { campaignId } = await context.params;
  const result = await createApplicationFeeCharge(auth.token, campaignId);
  if (!result.ok) return draftFailureResponse(result);

  return NextResponse.json(result.data, { status: 200 });
}
