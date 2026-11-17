import "server-only";

import { z } from "zod";

import {
  amlHistoryEndpoint,
  amlScreenEndpoint,
  AML_HISTORY_MAX_ITEMS,
  AML_SCREEN_TIMEOUT_MS,
  amlScreeningRecordSchema,
  amlScreeningResultSchema,
  amlScreenSchema,
  type AmlKind,
  type AmlScreeningRecord,
  type AmlScreeningResult,
  type AmlScreenInput,
} from "@/features/admin/lib/aml";
import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  adminReadUnavailable,
  adminWriteFailure,
  requireAdminApiSession,
} from "@/features/admin/server/admin-api";
import { fetchApiJson, isApiConfigured, sendApiJson } from "@/lib/api/server";

/**
 * A screening runs under the live administrator and is recorded by the
 * service, so a timeout or malformed confirmation may follow a saved record
 * and an updated account status. Failures never promise that nothing changed.
 */
function unconfirmedScreening(
  status = 502,
  code = "INVALID_RESPONSE",
): {
  ok: false;
  status: number;
  code: string;
  message: string;
} {
  return {
    ok: false,
    status: status || 503,
    code,
    message:
      "The service did not confirm the screening. A record may already have been saved; check the screening history before running again.",
  };
}

/**
 * AML screening is a compliance record, not an eligibility source: it neither
 * approves nor declines the account. Only the documented fields reach the
 * service, and the response must describe a screening result before it is
 * rendered. The response does not echo the subject, so this result carries the
 * validated request back for display rather than confirming an echo.
 */
export async function screenAml(input: unknown): Promise<
  | {
      ok: true;
      kind: AmlKind;
      userId: string;
      result: AmlScreeningResult;
    }
  | { ok: false; status: number; code: string; message: string }
> {
  const session = await requireAdminApiSession();
  if (!session.ok) return session;
  const parsed = amlScreenSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message: parsed.error.issues[0]?.message ?? "Check the screening fields.",
    };
  }
  const { kind, userId, ...fields } = parsed.data satisfies AmlScreenInput;
  const response = await sendApiJson(amlScreenEndpoint(kind), {
    method: "POST",
    token: session.token,
    body: { userId, ...fields },
    timeoutMs: AML_SCREEN_TIMEOUT_MS,
  });
  if (!response.ok) {
    if (kind === "business" && response.status === 404) {
      return {
        ok: false,
        status: 404,
        code: response.code,
        message:
          "This account has no registered business to screen. Business screening attaches to the account's business profile.",
      };
    }
    if (response.status === 0 || response.status >= 500)
      return unconfirmedScreening(response.status, response.code);
    return adminWriteFailure(response);
  }
  const result = amlScreeningResultSchema.safeParse(response.data);
  if (!result.success) return unconfirmedScreening();
  return { ok: true, kind, userId, result: result.data };
}

export type AmlHistoryRead =
  | { status: "ready"; screenings: AmlScreeningRecord[] }
  | { status: "unavailable"; message: string };

/**
 * The history read is server-only and gated like every admin read. The
 * endpoint returns a bare array (at most 100 records, newest first) with no
 * total, so anything longer than the documented page or a duplicated record id
 * makes the read fail closed rather than render a partial history.
 */
export async function listAmlScreenings(input: {
  userId: string;
  kind: AmlKind;
}): Promise<AmlHistoryRead> {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) {
    return {
      status: "unavailable",
      message: "An administrator account is required.",
    };
  }
  if (access.preview) {
    return {
      status: "unavailable",
      message:
        "Sign in with a live administrator account to use this service. Preview accounts cannot use live admin services.",
    };
  }
  const token = await readSessionToken();
  if (!token || !isApiConfigured()) {
    return {
      status: "unavailable",
      message: !token
        ? "Your session has expired. Sign in again to continue."
        : "The admin service is not configured for this deployment.",
    };
  }

  const userId = input.userId.trim().slice(0, 200);
  if (!userId) {
    return {
      status: "unavailable",
      message: "Enter an account id to load its screening history.",
    };
  }

  try {
    const payload = await fetchApiJson<unknown>(
      amlHistoryEndpoint(input.kind, userId),
      { token },
    );
    const parsed = z
      .array(amlScreeningRecordSchema)
      .max(AML_HISTORY_MAX_ITEMS)
      .safeParse(payload);
    if (
      !parsed.success ||
      new Set(parsed.data.map((record) => record.id)).size !==
        parsed.data.length
    ) {
      return {
        status: "unavailable",
        message:
          "The service returned an incomplete or invalid screening history. Refresh to try again.",
      };
    }
    return { status: "ready", screenings: parsed.data };
  } catch (error) {
    return adminReadUnavailable(error);
  }
}
