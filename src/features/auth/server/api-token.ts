import "server-only";

import type { ApiWriteFailure } from "@/lib/api/server";

import { readSessionToken } from "./session";

/**
 * The signed-in session token for a BFF call, or a ready-made 401 failure.
 *
 * The token stays in the HttpOnly cookie; route handlers pass it straight to the
 * API and never return it to the browser.
 */
export async function requireApiToken(
  message = "Sign in to continue.",
): Promise<{ ok: true; token: string } | ApiWriteFailure> {
  const token = await readSessionToken();
  if (!token) {
    return { ok: false, status: 401, code: "NOT_SIGNED_IN", message };
  }
  return { ok: true, token };
}
