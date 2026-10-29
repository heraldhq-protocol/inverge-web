import { NextResponse } from "next/server";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl } from "@/lib/api/server";

const UPSTREAM_TIMEOUT_MS = 15_000;

type ForwardOptions = {
  body?: unknown;
  method: "PATCH" | "POST" | "PUT";
  path: string;
};

/**
 * Forwards an authenticated idea write to the API.
 *
 * The API owns validation, ownership, quality checks and the publish gate. This
 * route only moves the session server-side; a preview identity has no API
 * account and is rejected rather than pretending a local save is live.
 */
export async function forwardIdeaWrite(
  request: Request,
  { body, method, path }: ForwardOptions,
): Promise<NextResponse> {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }

  if (isPreviewAuth()) {
    return NextResponse.json({ error: "api_required" }, { status: 503 });
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
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      method,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ error: "api_unreachable" }, { status: 502 });
  }

  const payload = (await upstream.json().catch(() => null)) as unknown;

  if (!upstream.ok) {
    return NextResponse.json(payload ?? { error: "api_error" }, {
      status: upstream.status,
    });
  }

  return NextResponse.json(payload ?? { ok: true });
}
