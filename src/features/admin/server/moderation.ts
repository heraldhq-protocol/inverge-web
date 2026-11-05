import "server-only";

import {
  matchesScreening,
  moderationCaseSchema,
  screenContentSchema,
  SCREENING_TIMEOUT_MS,
  type ModerationCase,
} from "@/features/admin/lib/moderation";
import {
  adminWriteFailure,
  requireAdminApiSession,
} from "@/features/admin/server/admin-api";
import { sendApiJson, type ApiWriteFailure } from "@/lib/api/server";

function unconfirmedScreening(
  status = 502,
  code = "INVALID_RESPONSE",
): ApiWriteFailure {
  return {
    ok: false,
    status: status || 503,
    code,
    message:
      "The service did not confirm the screening. A case may already have been saved; running again creates a new case.",
  };
}

/** FR-901 / NFR-14: advisory screening is privileged and never approves a listing. */
export async function screenContent(
  input: unknown,
): Promise<{ ok: true; screening: ModerationCase } | ApiWriteFailure> {
  const session = await requireAdminApiSession();
  if (!session.ok) return session;
  const parsed = screenContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message: parsed.error.issues[0]?.message ?? "Check the screening fields.",
    };
  }
  const response = await sendApiJson("/admin/moderation/screen", {
    method: "POST",
    token: session.token,
    body: parsed.data,
    timeoutMs: SCREENING_TIMEOUT_MS,
  });
  if (!response.ok) {
    if (response.status === 0 || response.status >= 500)
      return unconfirmedScreening(response.status, response.code);
    if (response.status === 404)
      return {
        ...adminWriteFailure(response),
        message: "Screening is not available on the connected service.",
      };
    return adminWriteFailure(response);
  }
  const receipt = moderationCaseSchema.safeParse(response.data);
  if (
    !receipt.success ||
    !matchesScreening(receipt.data, parsed.data, session.actorId)
  )
    return unconfirmedScreening();
  return { ok: true, screening: receipt.data };
}
