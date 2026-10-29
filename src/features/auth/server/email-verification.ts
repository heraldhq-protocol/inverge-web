import "server-only";

import {
  parseEmailVerificationStatus,
  type EmailVerificationStatus,
} from "@/features/auth/lib/email-verification";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl } from "@/features/auth/server/session-user";

const STATUS_TIMEOUT_MS = 5_000;

/**
 * The current account's email state, read with the HttpOnly session cookie.
 *
 * Returns `null` for every failure. A status page must never infer "verified"
 * from a failed lookup; the API rows are the only evidence.
 */
export async function readEmailVerification(): Promise<EmailVerificationStatus | null> {
  const token = await readSessionToken();
  const base = apiBaseUrl();
  if (!token || !base) return null;

  try {
    const response = await fetch(`${base}/auth/email`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return parseEmailVerificationStatus(await response.json());
  } catch {
    return null;
  }
}
