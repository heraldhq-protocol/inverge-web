import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isEmailVerificationError,
  parseEmailVerificationResult,
  parseEmailVerificationStatus,
} from "@/features/auth/lib/email-verification";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  clearEmailHint,
  readSessionToken,
} from "@/features/auth/server/session";
import { apiBaseUrl } from "@/features/auth/server/session-user";

/**
 * BFF for email capture and confirmation.
 *
 * The browser never sees the Inverge session token or the API key. This route
 * forwards only the documented fields, normalises errors to stable codes, and
 * never echoes a provider response or a verification code.
 */

const UPSTREAM_TIMEOUT_MS = 10_000;

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("request"),
    email: z.string().trim().min(3).max(254),
  }),
  z.object({
    action: z.literal("verify"),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/),
    email: z.string().trim().min(3).max(254),
  }),
  z.object({ action: z.literal("resend") }),
  z.object({ action: z.literal("cancel") }),
]);

type UpstreamFailure = {
  error?: { code?: unknown; details?: unknown };
  retryAfterSeconds?: unknown;
};

function retryAfterSeconds(body: UpstreamFailure | null): number | undefined {
  if (!body) return undefined;
  if (typeof body.retryAfterSeconds === "number") {
    return body.retryAfterSeconds;
  }
  const details = body.error?.details;
  if (details && typeof details === "object") {
    const value = (details as Record<string, unknown>).retryAfterSeconds;
    if (typeof value === "number") return value;
  }
  return undefined;
}

async function failure(response: Response, fallback: string) {
  if (response.status === 401) {
    return NextResponse.json({ error: "session_expired" }, { status: 401 });
  }

  const body = (await response
    .json()
    .catch(() => null)) as UpstreamFailure | null;
  const code = body?.error?.code;
  const error = isEmailVerificationError(code) ? code : fallback;
  const retry = retryAfterSeconds(body);

  return NextResponse.json(
    { ...(retry !== undefined ? { retryAfterSeconds: retry } : {}), error },
    { status: response.status },
  );
}

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET() {
  const token = await readSessionToken();
  const base = apiBaseUrl();
  if (!token) {
    return NextResponse.json({ error: "session_expired" }, { status: 401 });
  }
  if (!base) {
    return NextResponse.json({ error: "api_not_configured" }, { status: 503 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/auth/email`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  if (!upstream.ok) return failure(upstream, "email_status_failed");

  const status = parseEmailVerificationStatus(
    await upstream.json().catch(() => null),
  );
  if (!status) {
    return NextResponse.json({ error: "invalid_response" }, { status: 502 });
  }

  return noStore(NextResponse.json(status));
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const token = await readSessionToken();
  const base = apiBaseUrl();
  if (!token) {
    return NextResponse.json({ error: "session_expired" }, { status: 401 });
  }
  if (!base) {
    return NextResponse.json({ error: "api_not_configured" }, { status: 503 });
  }

  const input = parsed.data;
  const path =
    input.action === "request"
      ? "/auth/email/request"
      : input.action === "verify"
        ? "/auth/email/verify"
        : input.action === "resend"
          ? "/auth/email/resend"
          : "/auth/email/pending";
  const method = input.action === "cancel" ? "DELETE" : "POST";
  const body =
    input.action === "request"
      ? { email: input.email }
      : input.action === "verify"
        ? { code: input.code, email: input.email }
        : undefined;

  let upstream: Response;
  try {
    const init: RequestInit = {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      method,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    };
    if (body) init.body = JSON.stringify(body);

    upstream = await fetch(`${base}${path}`, init);
  } catch {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  if (!upstream.ok) {
    return failure(upstream, `${input.action}_failed`);
  }

  if (input.action === "cancel") {
    return noStore(NextResponse.json({ pendingEmail: null }));
  }

  const result = parseEmailVerificationResult(
    await upstream.json().catch(() => null),
  );
  if (!result) {
    return NextResponse.json({ error: "invalid_response" }, { status: 502 });
  }

  if (input.action === "verify") {
    await clearEmailHint();

    // The destination after confirmation depends on whether the shared profile
    // is complete. A failed lookup is treated as "still needed"; the profile
    // page re-checks and forwards a completed account to the dashboard.
    let requiresOnboarding = true;
    try {
      const me = await fetch(`${base}/auth/me`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
      if (me.ok) {
        const record = (await me.json().catch(() => null)) as {
          requiresOnboarding?: unknown;
        } | null;
        requiresOnboarding = record?.requiresOnboarding !== false;
      }
    } catch {
      // Keep the safe fallback.
    }

    return noStore(
      NextResponse.json({
        email: result.email,
        requiresOnboarding,
        status: "verified",
      }),
    );
  }

  return noStore(NextResponse.json(result));
}
