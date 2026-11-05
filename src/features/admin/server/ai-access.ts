import "server-only";

import {
  accessDecisionSchema,
  adminAccessRequestSchema,
  matchesAccessDecision,
  type AdminAccessRequest,
} from "@/features/admin/lib/access-requests";
import {
  aiAccessListSchema,
  type AiAccessQuery,
} from "@/features/admin/lib/ai-access";
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

export async function listAiAccessRequests(
  query: AiAccessQuery,
): Promise<AdminRead<AdminAccessRequest[]>> {
  const session = await requireAdminApiSession();
  if (!session.ok) return { status: "unavailable", message: session.message };
  const params = new URLSearchParams({ limit: String(query.limit) });
  if (query.status !== "ALL") params.set("status", query.status);
  try {
    const response = await fetchApiJson<unknown>(
      `/admin/ai/access-requests?${params}`,
      { token: session.token },
    );
    const result = aiAccessListSchema.parse(response);
    if (
      result.data.length > query.limit ||
      new Set(result.data.map((row) => row.id)).size !== result.data.length ||
      result.data.some(
        (row) => query.status !== "ALL" && row.status !== query.status,
      )
    )
      return adminReadUnavailable(null);
    return { status: "ready", data: result.data };
  } catch (error) {
    return adminReadUnavailable(error);
  }
}

/** D-055: the API owns the pending-only transition and the decision record. */
export async function decideAiAccess(
  id: string,
  input: unknown,
): Promise<{ ok: true; request: AdminAccessRequest } | ApiWriteFailure> {
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
    `/admin/ai/access-requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      token: session.token,
      body: decision.data,
    },
  );
  if (!result.ok) return adminWriteFailure(result);
  const receipt = adminAccessRequestSchema.safeParse(result.data);
  if (
    !receipt.success ||
    receipt.data.source !== "ADMIN" ||
    !matchesAccessDecision(receipt.data, id, decision.data)
  ) {
    return invalidAdminResponse();
  }
  return { ok: true, request: receipt.data };
}
