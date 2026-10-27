import "server-only";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl } from "@/lib/api/server";
import type {
  AdminCaseDetail,
  AdminCaseSummary,
  AdminQueue,
  VerificationEligibility,
  VerificationErrorCode,
  VerificationState,
} from "@/features/verification/types";

/**
 * Server-side calls to the verification API.
 *
 * The browser never holds a bearer token and never talks to Didit. Every read and
 * write below runs with the HttpOnly session cookie token, so the API remains
 * the only authority on eligibility.
 */

const REQUEST_TIMEOUT_MS = 10_000;

export type VerificationFailure = {
  ok: false;
  status: number;
  code:
    | VerificationErrorCode
    | "NOT_SIGNED_IN"
    | "API_NOT_CONFIGURED"
    | "API_UNREACHABLE"
    | "API_ERROR";
  message: string;
  details?: unknown;
};

export type VerificationResult<T> = { ok: true; data: T } | VerificationFailure;

type ErrorEnvelope = {
  code?: unknown;
  message?: unknown;
  blockers?: unknown;
  error?: { code?: unknown; message?: unknown; blockers?: unknown };
};

function failure(
  status: number,
  code: VerificationFailure["code"],
  message: string,
  details?: unknown,
): VerificationFailure {
  return { code, details, message, ok: false, status };
}

async function request<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<VerificationResult<T>> {
  const base = apiBaseUrl();
  if (!base) {
    return failure(
      503,
      "API_NOT_CONFIGURED",
      "This deployment has no Inverge API configured.",
    );
  }
  const token = await readSessionToken();
  if (!token) {
    return failure(401, "NOT_SIGNED_IN", "Sign in to continue.");
  }

  let response: Response;
  try {
    const body =
      init.body === undefined ? undefined : JSON.stringify(init.body);
    response = await fetch(`${base}${path}`, {
      ...(body === undefined ? {} : { body }),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      method: init.method ?? "GET",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return failure(
      502,
      "API_UNREACHABLE",
      "The verification service could not be reached.",
    );
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ErrorEnvelope | null;
  if (!response.ok) {
    const envelope =
      payload?.error && typeof payload.error === "object"
        ? payload.error
        : payload;
    return {
      code:
        typeof envelope?.code === "string"
          ? (envelope.code as VerificationErrorCode)
          : "API_ERROR",
      details: envelope?.blockers,
      message:
        typeof envelope?.message === "string"
          ? envelope.message
          : "The verification request failed.",
      ok: false,
      status: response.status,
    };
  }

  return { data: payload as T, ok: true };
}

export async function getVerificationState(): Promise<
  VerificationResult<VerificationState>
> {
  return request<VerificationState>("/verification/state");
}

export async function getVerificationEligibility(
  purpose:
    | "IDEA_VALIDATION"
    | "CAMPAIGN_CREATOR"
    | "BACKER_THRESHOLD" = "CAMPAIGN_CREATOR",
): Promise<VerificationResult<VerificationEligibility>> {
  return request<VerificationEligibility>(
    `/verification/eligibility?purpose=${purpose}`,
  );
}

export async function startVerificationSession(input: {
  subject?: "INDIVIDUAL" | "BUSINESS";
  purpose?: "IDEA_VALIDATION" | "CAMPAIGN_CREATOR" | "BACKER_THRESHOLD";
}): Promise<VerificationResult<{ caseId: string; verificationUrl: string }>> {
  return request("/verification/session", { body: input, method: "POST" });
}

export async function startBusinessVerification(input: {
  legalName: string;
  registrationNumber?: string;
  country?: string;
  businessType?: string;
  registeredAddress?: string;
  representativeName?: string;
  representativeRole?: string;
}): Promise<VerificationResult<{ caseId: string; verificationUrl: string }>> {
  return request("/verification/business/session", {
    body: input,
    method: "POST",
  });
}

export async function setAccountType(
  accountType: "INDIVIDUAL" | "BUSINESS",
): Promise<VerificationResult<VerificationState>> {
  return request("/verification/account-type", {
    body: { accountType },
    method: "POST",
  });
}

export async function getAdminQueues(): Promise<
  VerificationResult<AdminQueue>
> {
  return request("/verification/admin/queues");
}

export async function listAdminCases(
  query: Record<string, string | undefined> = {},
): Promise<
  VerificationResult<{ items: AdminCaseSummary[]; nextCursor: string | null }>
> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return request(`/verification/admin/cases${suffix}`);
}

export async function getAdminCase(
  id: string,
): Promise<VerificationResult<AdminCaseDetail>> {
  return request(`/verification/admin/cases/${encodeURIComponent(id)}`);
}

export async function resolveRisk(
  id: string,
  input: {
    decision: "CLEAR" | "CONFIRM_MATCH";
    reasonCode: string;
    reason: string;
  },
): Promise<VerificationResult<{ caseId: string; risk: string }>> {
  return request(
    `/verification/admin/cases/${encodeURIComponent(id)}/resolve`,
    {
      body: input,
      method: "POST",
    },
  );
}

export function verificationPreviewMode(): boolean {
  return isPreviewAuth();
}
