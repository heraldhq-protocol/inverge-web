import "server-only";

import { readSessionToken } from "@/features/auth/server/session";
import {
  adminCampaignDetailSchema,
  adminCampaignQueueSchema,
  campaignReviewDecisionSchema,
  reviewRequestSchema,
  type AdminCampaignDetail,
  type AdminCampaignQueue,
  type CampaignReviewDecision,
  type ReviewRequest,
  type ReviewQuery,
} from "@/features/campaigns/lib/admin-campaign-review";
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
  sendApiJson,
  type ApiWriteFailure,
} from "@/lib/api/server";

export type AdminCampaignRead<T> =
  { status: "ready"; data: T } | { status: "unavailable"; message: string };

async function sessionToken() {
  if (!isApiConfigured()) {
    throw new ApiRequestError(
      "Campaign review is unavailable until the API is configured.",
      503,
      "API_NOT_CONFIGURED",
    );
  }
  const token = await readSessionToken();
  if (!token) {
    throw new ApiRequestError(
      "Your admin session has expired. Sign in again to continue.",
      401,
      "NOT_SIGNED_IN",
    );
  }
  return token;
}

function unavailable(error: unknown): {
  status: "unavailable";
  message: string;
} {
  return {
    status: "unavailable",
    message:
      error instanceof ApiRequestError
        ? error.message
        : "The campaign review response could not be read. Refresh to try again.",
  };
}

// FR-304 / FR-901: callers gate admin access; every read also needs a real
// session token. Preview data is chosen by the route, never by a failed read.
export async function getAdminCampaigns(
  query: ReviewQuery,
): Promise<AdminCampaignRead<AdminCampaignQueue>> {
  try {
    const token = await sessionToken();
    const params = new URLSearchParams({
      reviewStatus: query.reviewStatus,
      skip: String(query.skip),
      take: String(query.take),
    });
    const response = await fetchApiJson<unknown>(`/admin/campaigns?${params}`, {
      token,
    });
    const data = adminCampaignQueueSchema.parse(response);
    if (
      data.skip !== query.skip ||
      data.take !== query.take ||
      data.reviewStatus !== query.reviewStatus
    ) {
      return unavailable(null);
    }
    return { status: "ready", data };
  } catch (error) {
    return unavailable(error);
  }
}

export async function getAdminCampaignDetail(
  id: string,
): Promise<AdminCampaignRead<AdminCampaignDetail> | { status: "not-found" }> {
  try {
    const token = await sessionToken();
    const response = await fetchApiJson<unknown>(
      `/admin/campaigns/${encodeURIComponent(id)}`,
      { token },
    );
    const data = adminCampaignDetailSchema.parse(response);
    if (data.campaign.id !== id) return unavailable(null);
    return { status: "ready", data };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404)
      return { status: "not-found" };
    return unavailable(error);
  }
}

export async function submitAdminCampaignReview(
  id: string,
  payload: ReviewRequest,
): Promise<
  { ok: true; data: CampaignReviewDecision; status: number } | ApiWriteFailure
> {
  const request = reviewRequestSchema.safeParse(payload);
  if (!request.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message: request.error.issues[0]?.message ?? "Invalid review decision.",
    };
  }
  let token: string;
  try {
    token = await sessionToken();
  } catch (error) {
    return {
      ok: false,
      status: error instanceof ApiRequestError ? error.status : 503,
      code: error instanceof ApiRequestError ? error.code : "API_UNAVAILABLE",
      message: unavailable(error).message,
    };
  }
  const result = await sendApiJson(
    `/admin/campaigns/${encodeURIComponent(id)}/review`,
    {
      method: "POST",
      token,
      body: request.data,
    },
  );
  if (!result.ok) {
    // A dropped connection can occur after a write committed. Never promise
    // that a timed-out review left the backend unchanged.
    return result.code === "API_UNREACHABLE"
      ? {
          ...result,
          message:
            "The decision could not be confirmed. Refresh the review before trying again.",
        }
      : result;
  }
  const parsed = campaignReviewDecisionSchema.safeParse(result.data);
  if (
    !parsed.success ||
    parsed.data.id !== id ||
    parsed.data.event.action !== request.data.action ||
    parsed.data.reviewReason !== (request.data.reason || null)
  ) {
    return {
      ok: false,
      status: 502,
      code: "INVALID_REVIEW_RESPONSE",
      message:
        "The decision response could not be confirmed. Refresh the review before trying again.",
    };
  }
  return { ...result, data: parsed.data };
}
