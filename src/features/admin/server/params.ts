import "server-only";

import {
  paramAuditListSchema,
  paramAuditQuerySchema,
  platformParamsSchema,
  previewParamAuditEntries,
  previewPlatformParams,
  updateParamsSchema,
  type ParamAuditEntry,
  type PlatformParams,
} from "@/features/admin/lib/params";
import {
  adminReadUnavailable,
  adminWriteFailure,
  requireAdminApiSession,
  type AdminRead,
} from "@/features/admin/server/admin-api";
import {
  fetchApiJson,
  sendApiJson,
  type ApiWriteFailure,
} from "@/lib/api/server";

export async function getPlatformParams(): Promise<AdminRead<PlatformParams>> {
  const session = await requireAdminApiSession();
  if (!session.ok) return { status: "unavailable", message: session.message };
  if (session.token === "preview") {
    return { status: "ready", data: previewPlatformParams };
  }
  try {
    const response = await fetchApiJson<unknown>("/admin/params", {
      token: session.token,
    });
    return { status: "ready", data: platformParamsSchema.parse(response) };
  } catch (error) {
    return adminReadUnavailable(error);
  }
}

function unconfirmedParams(
  status = 502,
  code = "INVALID_RESPONSE",
): ApiWriteFailure {
  return {
    ok: false,
    status: status || 503,
    code,
    message:
      "The service did not confirm parameter changes. Some keys may already have been updated; reload parameters before trying again.",
  };
}

export async function updatePlatformParams(
  input: unknown,
): Promise<{ ok: true; params: PlatformParams } | ApiWriteFailure> {
  const session = await requireAdminApiSession();
  if (!session.ok) return session;
  if (session.token === "preview") {
    return {
      ok: false,
      status: 403,
      code: "PREVIEW_MODE",
      message: "Preview mode: live parameter updates are disabled.",
    };
  }
  const parsed = updateParamsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message:
        parsed.error.issues[0]?.message ?? "Provide valid parameter values.",
    };
  }

  const response = await sendApiJson("/admin/params", {
    method: "PATCH",
    token: session.token,
    body: parsed.data,
  });

  if (!response.ok) {
    if (response.status === 0 || response.status >= 500) {
      return unconfirmedParams(response.status, response.code);
    }
    return adminWriteFailure(response);
  }

  const receipt = platformParamsSchema.safeParse(response.data);
  if (!receipt.success) {
    // If backend returns a confirmation envelope or updated subset, accept or report unconfirmed
    return unconfirmedParams();
  }

  return { ok: true, params: receipt.data };
}

export async function getPlatformParamsAudit(
  queryInput?: unknown,
): Promise<AdminRead<ParamAuditEntry[]>> {
  const session = await requireAdminApiSession();
  if (!session.ok) return { status: "unavailable", message: session.message };
  if (session.token === "preview") {
    return { status: "ready", data: previewParamAuditEntries };
  }

  const parsedQuery = paramAuditQuerySchema.safeParse(queryInput ?? {});
  const queryParams = new URLSearchParams();
  if (parsedQuery.success) {
    if (parsedQuery.data.key) queryParams.set("key", parsedQuery.data.key);
    queryParams.set("limit", String(parsedQuery.data.limit));
    queryParams.set("offset", String(parsedQuery.data.offset));
  }

  const qs = queryParams.toString();
  const endpoint = `/admin/params/audit${qs ? `?${qs}` : ""}`;

  try {
    const response = await fetchApiJson<unknown>(endpoint, {
      token: session.token,
    });
    return { status: "ready", data: paramAuditListSchema.parse(response) };
  } catch (error) {
    return adminReadUnavailable(error);
  }
}
