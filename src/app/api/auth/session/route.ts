import { NextResponse } from "next/server";
import { z } from "zod";

import { ONBOARDING_INTENTS } from "@/features/auth/lib/onboarding";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  previewSubjectFromIdToken,
  readPreviewSession,
  writePreviewSession,
} from "@/features/auth/server/preview-session";
import {
  clearSessionCookie,
  writeOnboardingIntent,
  writeSessionCookie,
} from "@/features/auth/server/session";
import { apiBaseUrl } from "@/features/auth/server/session-user";

/**
 * Exchanges a provider identity token for an Inverge session.
 *
 * This is the BFF half of the session: the browser hands over the Web3Auth
 * `id_token`, the server exchanges it with the API, and the returned Inverge
 * session JWT is written straight into an HttpOnly cookie. The token is never
 * returned in the response body, so no client script can read or copy it.
 *
 * The API verifies the token's signature, issuer, audience and wallet
 * attestation; this route adds no trust of its own and forwards nothing else.
 */

const exchangeRequestSchema = z.object({
  idToken: z.string().min(1).max(16_384),
  intent: z.enum(ONBOARDING_INTENTS).optional(),
  walletAddress: z.string().min(32).max(64).optional(),
});

const UPSTREAM_TIMEOUT_MS = 10_000;

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

  const parsed = exchangeRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (isPreviewAuth()) {
    const subject = previewSubjectFromIdToken(parsed.data.idToken);
    if (!subject) {
      return NextResponse.json({ error: "session_rejected" }, { status: 401 });
    }

    const existing = await readPreviewSession();
    const profile = existing?.subject === subject ? existing : null;

    await writePreviewSession({
      v: 1,
      subject,
      accountType: profile?.accountType ?? null,
      displayName: profile?.displayName ?? null,
      contactName: profile?.contactName ?? null,
      username: profile?.username ?? null,
    });
    // A stale API session must not be picked up if the mode changes back.
    await clearSessionCookie();
    await writeOnboardingIntent(parsed.data.intent ?? "general");

    return NextResponse.json({
      requiresOnboarding:
        !profile?.accountType || !profile.displayName || !profile.username,
    });
  }

  const base = apiBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "api_not_configured" }, { status: 503 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/auth/session`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: parsed.data.idToken,
        ...(parsed.data.walletAddress
          ? { walletAddress: parsed.data.walletAddress }
          : {}),
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  if (!upstream.ok) {
    // A 4xx means the provider token or the claimed wallet was rejected. A 5xx
    // is the API's problem, so the client is told to retry rather than to sign
    // in again with different credentials.
    if (process.env.NODE_ENV !== "production") {
      const failure = (await upstream.json().catch(() => null)) as {
        message?: unknown;
      } | null;
      // Never log the token itself; the API's message names the failed check.
      console.warn(
        "[auth/session] provider token rejected",
        upstream.status,
        typeof failure?.message === "string" ? failure.message : "no message",
      );
    }
    return NextResponse.json(
      {
        error: upstream.status >= 500 ? "api_unreachable" : "session_rejected",
      },
      { status: upstream.status >= 500 ? 502 : 401 },
    );
  }

  const body = (await upstream.json().catch(() => null)) as {
    requiresOnboarding?: unknown;
    sessionToken?: unknown;
  } | null;

  if (!body || typeof body.sessionToken !== "string" || !body.sessionToken) {
    return NextResponse.json({ error: "invalid_response" }, { status: 502 });
  }

  await writeSessionCookie(body.sessionToken);
  // Always written, not only for creator intent: a stale intent from an
  // abandoned flow must never decide where a fresh sign-in lands.
  await writeOnboardingIntent(parsed.data.intent ?? "general");

  return NextResponse.json({
    requiresOnboarding: body.requiresOnboarding === true,
  });
}
