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
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
};

const DEFAULT_TIMEOUT_MS = 20_000;

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
    method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
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
    return {
      ok: false,
      status: response.status,
      code:
        typeof envelope?.error?.code === "string" && envelope.error.code.trim()
          ? envelope.error.code
          : "API_ERROR",
      message:
        typeof envelope?.error?.message === "string" &&
        envelope.error.message.trim()
          ? envelope.error.message
          : `The request failed (${response.status}).`,
      details: envelope?.error?.details,
    };
  }

  return { ok: true, data: payload as T };
}
