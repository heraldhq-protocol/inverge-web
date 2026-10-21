import { NextResponse } from "next/server";
import { z } from "zod";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl } from "@/features/auth/server/session-user";

/**
 * Proxies the API's public username check for the onboarding form.
 *
 * The check is a convenience hint, not a reservation: the API re-validates on
 * save, so a race between two people choosing the same handle still ends with
 * one of them being asked to pick again.
 *
 * A session is required to keep this from becoming an anonymous enumeration
 * endpoint. No `Origin` check is needed: this is a read-only request and the
 * only effect is the response.
 */

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .transform((value) => value.toLowerCase());

const UPSTREAM_TIMEOUT_MS = 5_000;

export async function GET(request: Request) {
  if (isPreviewAuth()) {
    // There is no account directory to check against. The form treats this as
    // "could not check" and still lets the visitor continue, which is honest.
    return NextResponse.json(
      { error: "not_available_in_preview" },
      { status: 501 },
    );
  }

  const base = apiBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "api_not_configured" }, { status: 503 });
  }

  if (!(await readSessionToken())) {
    return NextResponse.json({ error: "session_required" }, { status: 401 });
  }

  const raw = new URL(request.url).searchParams.get("username") ?? "";
  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_username" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${base}/auth/check-username?username=${encodeURIComponent(parsed.data)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      },
    );
  } catch {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  const body = (await upstream.json().catch(() => null)) as {
    available?: unknown;
  } | null;

  if (typeof body?.available !== "boolean") {
    return NextResponse.json({ error: "invalid_response" }, { status: 502 });
  }

  return NextResponse.json({ available: body.available });
}
