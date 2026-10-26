import { NextResponse } from "next/server";

import { draftFailureResponse } from "@/app/api/campaigns/http";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import {
  campaignDraftToken,
  readCampaignDraft,
} from "@/features/campaigns/server/drafts";

type RouteContext = { params: Promise<{ campaignId: string }> };

/**
 * The authoritative draft, used by the editor to resume after a reload.
 *
 * Read-only and cookie-authenticated, so it is not origin-checked; a cross-site
 * `GET` cannot read the JSON because it is not sent with CORS permission.
 */
export async function GET(_request: Request, context: RouteContext) {
  if (isPreviewAuth()) {
    return NextResponse.json(
      {
        error: {
          code: "API_REQUIRED",
          message:
            "Preview sign-in has no backend account. Sign in with the API to load a draft.",
        },
      },
      { status: 503 },
    );
  }

  const auth = await campaignDraftToken();
  if (!auth.ok) return draftFailureResponse(auth);

  const { campaignId } = await context.params;
  const result = await readCampaignDraft(auth.token, campaignId);
  if (!result.ok) return draftFailureResponse(result);

  return NextResponse.json(result.data, { status: 200 });
}
