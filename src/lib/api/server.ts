import "server-only";

/**
 * The versioned API base, or `null` when this deployment has no API to talk to.
 *
 * There is deliberately no default: guessing a port would either point the web
 * app at the wrong service or, worse, at itself. A missing value is reported as
 * "unavailable" instead of failing open.
 *
 * `INVERGE_API_URL` is documented as an origin. The API serves every route under
 * `/api/v1`, so append the prefix here rather than at each call site; an operator
 * who already supplied the versioned base is accepted without doubling it.
 */
export function apiBaseUrl(): string | null {
  const raw = process.env.INVERGE_API_URL?.trim();
  if (!raw) return null;
  const base = raw.replace(/\/+$/, "");
  return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
}

export function isApiConfigured(): boolean {
  return apiBaseUrl() !== null;
}

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

type ApiErrorEnvelope = {
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
};

const DEFAULT_TIMEOUT_MS = 5_000;

/**
 * One read from the versioned API.
 *
 * `no-store` keeps a live page from serving a snapshot older than the API's own
 * cache. A network failure becomes `status: 0` so callers can distinguish
 * "unreachable" from "not found" without parsing messages.
 */
export async function fetchApiJson<Payload>(
  path: string,
  options: { timeoutMs?: number; token?: string | null } = {},
): Promise<Payload> {
  const base = apiBaseUrl();
  if (!base) {
    throw new ApiRequestError(
      "The API is not configured.",
      0,
      "API_NOT_CONFIGURED",
    );
  }

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers();
  if (options.token) headers.set("authorization", `Bearer ${options.token}`);

  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch {
    throw new ApiRequestError(
      "The API could not be reached.",
      0,
      "API_UNREACHABLE",
    );
  }

  if (!response.ok) {
    let body: ApiErrorEnvelope | null = null;
    try {
      body = (await response.json()) as ApiErrorEnvelope;
    } catch {
      body = null;
    }

    const message =
      typeof body?.error?.message === "string" && body.error.message.trim()
        ? body.error.message
        : `The API returned ${response.status}.`;
    const code =
      typeof body?.error?.code === "string" && body.error.code.trim()
        ? body.error.code
        : "API_ERROR";

    throw new ApiRequestError(message, response.status, code);
  }

  return (await response.json()) as Payload;
}

export type ApiWriteSuccess = {
  ok: true;
  data: unknown;
  status: number;
};

export type ApiWriteFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export type ApiWriteResult = ApiWriteSuccess | ApiWriteFailure;

/**
 * One state-changing call to the versioned API.
 *
 * Unlike `fetchApiJson`, failures are returned: a BFF route has to forward the
 * API's status and error envelope (a 409 stale draft, a 403 entitlement, a 429
 * quota) without flattening it into a generic 500. Network and configuration
 * failures become 503 so they are always valid HTTP responses.
 */
export async function sendApiJson(
  path: string,
  options: {
    method: "DELETE" | "GET" | "PATCH" | "POST";
    token?: string | null;
    body?: unknown;
    timeoutMs?: number;
  },
): Promise<ApiWriteResult> {
  const base = apiBaseUrl();
  if (!base) {
    return {
      ok: false,
      status: 503,
      code: "API_NOT_CONFIGURED",
      message: "This deployment has no API configured.",
    };
  }

  const headers: Record<string, string> = {};
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers["content-type"] = "application/json";

  let response: Response;
  const init: RequestInit = {
    cache: "no-store",
    headers,
    method: options.method,
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  try {
    response = await fetch(
      `${base}${path.startsWith("/") ? path : `/${path}`}`,
      init,
    );
  } catch {
    return {
      ok: false,
      status: 503,
      code: "API_UNREACHABLE",
      message: "The API could not be reached. Nothing was changed.",
    };
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ApiErrorEnvelope | null;

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string" &&
      payload.error.message.trim()
        ? payload.error.message
        : `The API returned ${response.status}.`;
    const code =
      typeof payload?.error?.code === "string" && payload.error.code.trim()
        ? payload.error.code
        : "API_ERROR";
    return {
      ok: false,
      status: response.status,
      code,
      message,
      details: payload?.error?.details,
    };
  }

  return { ok: true, data: payload, status: response.status };
}
