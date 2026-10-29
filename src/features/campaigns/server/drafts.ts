import "server-only";

import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl } from "@/lib/api/server";

/**
 * Server-side calls to the API's campaign draft routes.
 *
 * The browser never holds the session token, so it cannot call the API directly.
 * The BFF route handlers call this module with the HttpOnly cookie's token; this
 * module never reads a cookie itself, so it is equally usable from a server
 * component rendering a resumed draft.
 *
 * Failures are returned rather than thrown: a 409 has to reach the editor intact
 * (it carries the current version), and a 4xx must not be flattened into a
 * generic 500 on the way through the BFF.
 */

const REQUEST_TIMEOUT_MS = 10_000;

export type DraftApiSuccess = { ok: true; data: unknown; status: number };

export type DraftApiFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export type DraftApiResult = DraftApiSuccess | DraftApiFailure;

type ErrorEnvelope = {
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
};

function failure(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): DraftApiFailure {
  return { code, details, message, ok: false, status };
}

/** A signed-in session token, or a ready-made failure for the caller to return. */
export async function campaignDraftToken(): Promise<
  { ok: true; token: string } | DraftApiFailure
> {
  const token = await readSessionToken();
  if (!token) {
    return failure(
      401,
      "NOT_SIGNED_IN",
      "Sign in before saving a campaign draft.",
    );
  }
  return { ok: true, token };
}

async function request(
  token: string,
  path: string,
  init: { method: "GET" | "PATCH" | "POST"; body?: unknown },
): Promise<DraftApiResult> {
  const base = apiBaseUrl();
  if (!base) {
    return failure(
      503,
      "API_NOT_CONFIGURED",
      "This deployment has no campaign API configured.",
    );
  }

  let response: Response;
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    const requestInit: RequestInit = {
      cache: "no-store",
      headers,
      method: init.method,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    };
    if (init.body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestInit.body = JSON.stringify(init.body);
    }

    response = await fetch(`${base}${path}`, requestInit);
  } catch {
    return failure(
      503,
      "API_UNREACHABLE",
      "The campaign API could not be reached. Your draft is unchanged.",
    );
  }

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const envelope = payload as ErrorEnvelope | null;
    const code =
      typeof envelope?.error?.code === "string"
        ? envelope.error.code
        : "API_ERROR";
    const message =
      typeof envelope?.error?.message === "string"
        ? envelope.error.message
        : `The campaign API returned ${response.status}.`;
    return failure(response.status, code, message, envelope?.error?.details);
  }

  return { data: payload, ok: true, status: response.status };
}

export function createCampaignDraft(
  token: string,
  body: unknown,
): Promise<DraftApiResult> {
  return request(token, "/campaigns", { body, method: "POST" });
}

export function updateCampaignDraft(
  token: string,
  campaignId: string,
  body: unknown,
): Promise<DraftApiResult> {
  return request(token, `/campaigns/${encodeURIComponent(campaignId)}`, {
    body,
    method: "PATCH",
  });
}

export function readCampaignDraft(
  token: string,
  campaignId: string,
): Promise<DraftApiResult> {
  return request(token, `/campaigns/${encodeURIComponent(campaignId)}/draft`, {
    method: "GET",
  });
}

/**
 * Starts or resumes the one FR-311 application-fee charge. The API refuses to
 * create a second charge: a pending one returns its stored checkout URL and a
 * successful one is returned with `alreadyPaid`.
 */
export function createApplicationFeeCharge(
  token: string,
  campaignId: string,
): Promise<DraftApiResult> {
  return request(
    token,
    `/campaigns/${encodeURIComponent(campaignId)}/application-fee`,
    { method: "POST" },
  );
}

/**
 * Submits the draft for curation review. The API re-checks verification and the
 * linked fee inside the same transaction; the web's disabled state is only an
 * explanation, never the gate.
 */
export function submitCampaignDraft(
  token: string,
  campaignId: string,
  body: unknown,
): Promise<DraftApiResult> {
  return request(token, `/campaigns/${encodeURIComponent(campaignId)}/submit`, {
    body,
    method: "POST",
  });
}
