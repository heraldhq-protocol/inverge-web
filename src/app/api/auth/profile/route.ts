import { NextResponse } from "next/server";
import { z } from "zod";

import { ACCOUNT_TYPES, postProfilePath } from "@/features/auth/lib/onboarding";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import {
  readPreviewSession,
  writePreviewSession,
} from "@/features/auth/server/preview-session";
import {
  clearOnboardingIntent,
  readOnboardingIntent,
  readSessionToken,
} from "@/features/auth/server/session";
import { apiBaseUrl } from "@/features/auth/server/session-user";

/**
 * Stores the shared onboarding profile through the API.
 *
 * The browser never holds a bearer token, so this route reads the session from
 * its HttpOnly cookie, forwards it to the API, and returns only where the client
 * should go next. Validation is repeated here so a malformed request fails
 * before it reaches the API; the API's own validation remains authoritative.
 *
 * This endpoint changes state, so it requires a same-origin `Origin` header. The
 * cookie is `SameSite=Lax`, but an explicit check keeps a cross-site form post
 * from being mistaken for an intentional save.
 */

const profileSchema = z.object({
  /**
   * Account shape and business contact are preview-only for now: the API's
   * `CreatorProfile` has no place to store them yet. They are accepted here so
   * the preview flow can be exercised end to end, and deliberately dropped on
   * the live API path rather than sent as unknown fields.
   */
  accountType: z.enum(ACCOUNT_TYPES).optional(),
  contactName: z.string().trim().min(1).max(50).optional(),
  // An uploaded picture is /api/media/<id>; a provider picture is https. The
  // API re-validates both shapes and enforces ownership of the asset.
  avatarUrl: z.string().trim().max(2048).optional(),
  // Public bio. The API caps it at 280 characters and moderates it before saving.
  bio: z.string().trim().max(280).optional(),
  displayName: z.string().trim().min(1).max(50),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .transform((value) => value.toLowerCase()),
});

const UPSTREAM_TIMEOUT_MS = 10_000;

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (isPreviewAuth()) {
    const preview = await readPreviewSession();
    if (!preview) {
      return NextResponse.json({ error: "session_expired" }, { status: 401 });
    }

    const { accountType, contactName, displayName, username } = parsed.data;

    // The preview flow always asks the account question; an old cookie or a
    // hand-crafted request must not skip it and land as a completed profile.
    if (!accountType) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (accountType === "business" && !contactName) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    await writePreviewSession({
      ...preview,
      accountType,
      displayName,
      contactName: accountType === "business" ? (contactName ?? null) : null,
      username,
    });

    const intent = await readOnboardingIntent();
    await clearOnboardingIntent();

    return NextResponse.json({ nextPath: postProfilePath(intent) });
  }

  const base = apiBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "api_not_configured" }, { status: 503 });
  }

  const token = await readSessionToken();
  if (!token) {
    return NextResponse.json({ error: "session_required" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/auth/me/profile`, {
      // Preview-only fields stay in the preview cookie; the live API schema owns
      // the shared profile and rejects fields it does not know.
      body: JSON.stringify({
        displayName: parsed.data.displayName,
        username: parsed.data.username,
        ...(parsed.data.avatarUrl !== undefined
          ? { avatarUrl: parsed.data.avatarUrl }
          : {}),
        ...(parsed.data.bio !== undefined ? { bio: parsed.data.bio } : {}),
      }),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  if (upstream.status === 401) {
    return NextResponse.json({ error: "session_expired" }, { status: 401 });
  }

  if (upstream.status === 400) {
    // The API rejects a duplicate handle with a 400 and a human-readable reason.
    // Only that known case is surfaced as a field-specific error; every other
    // rejection stays generic so internal messages are not reflected.
    const body = (await upstream.json().catch(() => null)) as {
      message?: unknown;
    } | null;
    const message = typeof body?.message === "string" ? body.message : "";

    if (/username/i.test(message)) {
      return NextResponse.json({ error: "username_taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "profile_rejected" }, { status: 400 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  // The profile step is the only consumer of the onboarding hint, and the API
  // has now accepted the profile that made it meaningful.
  const intent = await readOnboardingIntent();
  await clearOnboardingIntent();

  return NextResponse.json({ nextPath: postProfilePath(intent) });
}
