import "server-only";

import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  ApiRequestError,
  isApiConfigured,
  type ApiWriteFailure,
} from "@/lib/api/server";

export type AdminRead<T> =
  { status: "ready"; data: T } | { status: "unavailable"; message: string };

/** FR-901: reads and writes each require a live, server-verified admin. */
export async function requireAdminApiSession(): Promise<
  { ok: true; token: string } | ApiWriteFailure
> {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) {
    return {
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: "An administrator account is required.",
    };
  }
  if (access.preview) {
    return {
      ok: false,
      status: 503,
      code: "API_REQUIRED",
      message:
        "Sign in with a live administrator account to use this service. Preview accounts cannot read or change access.",
    };
  }
  const token = await readSessionToken();
  if (!token) {
    return {
      ok: false,
      status: 401,
      code: "NOT_SIGNED_IN",
      message: "Your session has expired. Sign in again to continue.",
    };
  }
  if (!isApiConfigured()) {
    return {
      ok: false,
      status: 503,
      code: "API_NOT_CONFIGURED",
      message: "The admin service is not configured for this deployment.",
    };
  }
  return { ok: true, token };
}

export function adminReadUnavailable(error: unknown): {
  status: "unavailable";
  message: string;
} {
  const status = error instanceof ApiRequestError ? error.status : 0;
  return {
    status: "unavailable",
    message:
      status === 401
        ? "Your session has expired. Sign in again to continue."
        : status === 403
          ? "Your account no longer has access to this admin service."
          : status === 404
            ? "This admin service is not enabled on the connected API."
            : "The service could not return a valid response. Refresh to try again.",
  };
}

/** A timeout may follow a committed write. Never promise that nothing changed. */
export function adminWriteFailure(failure: ApiWriteFailure): ApiWriteFailure {
  const messages: Record<number, string> = {
    400: "The service rejected these values. Check the fields and try again.",
    401: "Your session has expired. Sign in again before trying again.",
    403: "Your account is not allowed to perform this action.",
    404: "This record is no longer available. Refresh before continuing.",
    409: "This record has changed or already been decided. Refresh before continuing.",
    422: "The service rejected these values. Check the fields and try again.",
    429: "Too many requests. Wait a moment before trying again.",
  };
  return {
    ok: false,
    status: failure.status || 503,
    code: failure.code,
    message:
      messages[failure.status] ??
      "The service did not confirm the change. Refresh to check its current state before trying again.",
  };
}

export function invalidAdminResponse(): ApiWriteFailure {
  return {
    ok: false,
    status: 502,
    code: "INVALID_RESPONSE",
    message:
      "The service did not confirm the requested change. Refresh to check its current state before trying again.",
  };
}
