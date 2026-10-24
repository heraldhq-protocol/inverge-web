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
  options: { timeoutMs?: number } = {},
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
  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
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
