import { NextResponse } from "next/server";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl } from "@/lib/api/server";

const UPSTREAM_TIMEOUT_MS = 10_000;

/**
 * Forwards one notification state change to the API.
 *
 * The browser has no bearer token; the BFF reads the HttpOnly session, checks
 * the request is same-origin, and never turns a provider failure into a local
 * success. Preview auth is a browser-local identity and has no server rows to
 * update, so the caller keeps preview state in React.
 */
export async function forwardNotificationAction(
  request: Request,
  path: string,
  method: "PATCH" | "POST",
): Promise<NextResponse> {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }

  if (isPreviewAuth()) {
    return NextResponse.json({ ok: true });
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
    upstream = await fetch(`${base}${path}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
      method,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  if (upstream.status === 401) {
    return NextResponse.json({ error: "session_expired" }, { status: 401 });
  }
  if (upstream.status === 404) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  const body = (await upstream.json().catch(() => null)) as unknown;
  return NextResponse.json(body ?? { ok: true });
}
