import { NextResponse } from "next/server";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { ApiRequestError, fetchApiJson } from "@/lib/api/server";

const ACCESS_TIMEOUT_MS = 10_000;

/**
 * Reads the caller's assistant entitlement and today's usage.
 *
 * The token stays in the HttpOnly cookie and is only attached server-side. A
 * preview identity has no API account, so it is rejected instead of showing a
 * fabricated premium state.
 */
export async function forwardAiAccess(): Promise<NextResponse> {
  if (isPreviewAuth()) {
    return NextResponse.json({ error: "api_required" }, { status: 503 });
  }

  const token = await readSessionToken();
  if (!token) {
    return NextResponse.json({ error: "session_required" }, { status: 401 });
  }

  try {
    const data = await fetchApiJson<unknown>("/ai/access", {
      token,
      timeoutMs: ACCESS_TIMEOUT_MS,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      const status =
        error.status >= 400 && error.status <= 599 ? error.status : 502;
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status },
      );
    }
    return NextResponse.json(
      {
        error: {
          code: "API_UNREACHABLE",
          message: "The assistant access check could not be completed.",
        },
      },
      { status: 502 },
    );
  }
}
