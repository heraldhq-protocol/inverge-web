import "server-only";

import {
  accessDecisionSchema,
  matchesAccessDecision,
} from "@/features/admin/lib/access-requests";
import {
  adminAnalyticsAccessRequestSchema,
  analyticsAccessListSchema,
  type AdminAnalyticsAccessRequest,
  type AnalyticsAccessList,
  type AnalyticsAccessQuery,
} from "@/features/admin/lib/analytics-access";
import {
  adminReadUnavailable,
  adminWriteFailure,
  invalidAdminResponse,
  requireAdminApiSession,
  type AdminRead,
} from "@/features/admin/server/admin-api";
import {
  fetchApiJson,
  sendApiJson,
  type ApiWriteFailure,
} from "@/lib/api/server";

export async function listAnalyticsAccessRequests(
  query: AnalyticsAccessQuery,
): Promise<AdminRead<AnalyticsAccessList>> {
  const session = await requireAdminApiSession();
  if (!session.ok) return { status: "unavailable", message: session.message };
  if (query.cursor && query.cursor.length > 2048) {
    return {
      status: "unavailable",
      message:
        "This page reference is invalid. Return to the first page to continue.",
    };
  }
  const params = new URLSearchParams({ limit: String(query.limit) });
  if (query.status !== "ALL") params.set("status", query.status);
  if (query.cursor) params.set("cursor", query.cursor);
  try {
    const response = await fetchApiJson<unknown>(
      `/admin/analytics/access-requests?${params}`,
      { token: session.token },
    );
    const data = analyticsAccessListSchema.parse(response);
    if (
      data.page.limit !== query.limit ||
      (data.page.nextCursor !== null &&
        data.page.nextCursor === query.cursor) ||
      new Set(data.data.map((row) => row.id)).size !== data.data.length ||
      data.data.some(
        (row) => query.status !== "ALL" && row.status !== query.status,
      )
    )
      return adminReadUnavailable(null);
    return { status: "ready", data };
  } catch (error) {
    return adminReadUnavailable(error);
  }
}

/** FR-901: analytics grants may be revised; their REQUEST/PAID source is retained. */
export async function decideAnalyticsAccess(
  id: string,
  input: unknown,
): Promise<
  { ok: true; request: AdminAnalyticsAccessRequest } | ApiWriteFailure
> {
  const session = await requireAdminApiSession();
  if (!session.ok) return session;
  const decision = accessDecisionSchema.safeParse(input);
  if (!id.trim() || id.length > 200 || !decision.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message: decision.success
        ? "The request identifier is invalid."
        : (decision.error.issues[0]?.message ??
          "Choose an approval or rejection."),
    };
  }
  const result = await sendApiJson(
    `/admin/analytics/access-requests/${encodeURIComponent(id)}`,
    { method: "PATCH", token: session.token, body: decision.data },
  );
  if (!result.ok) return adminWriteFailure(result);
  const receipt = adminAnalyticsAccessRequestSchema.safeParse(result.data);
  if (
    !receipt.success ||
    !matchesAccessDecision(receipt.data, id, decision.data)
  )
    return invalidAdminResponse();
  return { ok: true, request: receipt.data };
}
