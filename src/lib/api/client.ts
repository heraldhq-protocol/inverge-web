export type ClientJsonSuccess<T> = { ok: true; data: T };

export type ClientJsonFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export type ClientJsonResult<T> = ClientJsonSuccess<T> | ClientJsonFailure;

type ErrorEnvelope = {
  error?: unknown;
};

const DEFAULT_TIMEOUT_MS = 20_000;

const BFF_ERROR_MESSAGES: Record<string, string> = {
  api_required:
    "Sign in with the API to use the assistant. This preview keeps the manual flow.",
  session_required: "Sign in to use the assistant.",
  api_not_configured: "The assistant is not configured on this deployment.",
  api_unreachable: "The API could not be reached. Nothing was changed.",
  origin_not_allowed: "The request was refused.",
};

/**
 * One same-origin call to a BFF route.
 *
 * Failures are returned rather than thrown so a form can render the API's own
 * message and code. The session lives in an HttpOnly cookie, so there is no
 * token to attach here; `same-origin` credentials are enough.
 */
export async function sendJson<T>(
  path: string,
  options: {
    method: "GET" | "POST" | "PATCH";
    body?: unknown;
    timeoutMs?: number;
  },
): Promise<ClientJsonResult<T>> {
  let response: Response;

  const init: RequestInit = {
    method: options.method,
    credentials: "same-origin",
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  };
  if (options.body !== undefined) {
    init.headers = { "content-type": "application/json" };
    init.body = JSON.stringify(options.body);
  }

  try {
    response = await fetch(path, init);
  } catch {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
      message: "The request could not be completed. Check your connection.",
    };
  }

  const payload = (await response.json().catch(() => null)) as
    ErrorEnvelope | unknown;

  if (!response.ok) {
    const envelope = payload as ErrorEnvelope | null;
    const rawError = envelope?.error;
    const objectError =
      rawError && typeof rawError === "object"
        ? (rawError as {
            code?: unknown;
            message?: unknown;
            details?: unknown;
          })
        : null;
    const stringError = typeof rawError === "string" ? rawError : null;
    const code =
      typeof objectError?.code === "string" && objectError.code.trim()
        ? objectError.code
        : (stringError ?? "API_ERROR");
    const message =
      typeof objectError?.message === "string" && objectError.message.trim()
        ? objectError.message
        : stringError
          ? (BFF_ERROR_MESSAGES[stringError] ??
            `The request failed (${response.status}).`)
          : `The request failed (${response.status}).`;

    return {
      ok: false,
      status: response.status,
      code,
      message,
      details: objectError?.details,
    };
  }

  return { ok: true, data: payload as T };
}
