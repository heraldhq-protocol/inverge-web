import "server-only";

import { cache } from "react";

import type { AccountType } from "@/features/auth/lib/onboarding";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import {
  readPreviewSession,
  type PreviewSession,
} from "@/features/auth/server/preview-session";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl } from "@/lib/api/server";
import { safeAvatarUrl } from "@/lib/public-avatar";

export { apiBaseUrl } from "@/lib/api/server";

export type SessionRole = "USER" | "COMPLIANCE_REVIEWER" | "ADMIN";

export type SessionUser = {
  id: string;
  email: string | null;
  /** True only when the API has proven ownership of the stored address. */
  emailVerified: boolean;
  /**
   * True when the API requires a verified email before authored actions.
   * Presentation only; every guarded API route re-checks it.
   */
  requiresEmailVerification: boolean;
  /** Server-side role projection. Never used as a client access decision. */
  role: SessionRole;
  /** Set only when the account has a public profile; never derived from email. */
  displayName: string | null;
  /** Public handle, or `null` while the profile is incomplete. */
  username: string | null;
  /**
   * Provider or creator avatar URL, already filtered through the public image
   * allowlist. `null` means render initials.
   */
  avatarUrl: string | null;
  /**
   * The API's authoritative answer to "is the shared profile step unfinished?".
   * Defaults to `true` when the field is absent: skipping onboarding is the more
   * dangerous mistake, so an unexpected payload is treated as incomplete.
   */
  requiresOnboarding: boolean;
  /**
   * `preview` means the identity is local to this browser and was never
   * exchanged with the API. It must not be presented as a live account.
   */
  mode: "live" | "preview";
  /**
   * Preview-only account shape. `undefined` for API accounts until the API can
   * store it; `null` while the preview visitor has not answered the question.
   */
  accountType?: AccountType | null;
  /** Preview-only business contact. Never a public display name. */
  contactName?: string | null;
};

/**
 * The versioned API base, or `null` when this deployment has no API to talk to.
 *
 * Re-exported from `@/lib/api/server` so the auth surface keeps its existing
 * import while every feature shares one normaliser.
 */

const SESSION_LOOKUP_TIMEOUT_MS = 3_000;

/**
 * Projects the API's `/auth/me` payload onto the few fields the web app needs.
 * Role stays server-side and is read only by server gates; provider id, wallet
 * addresses, and creator statistics stay server-side too.
 *
 * The API's creator projection falls back to the user id when no username is
 * stored. That fallback is an internal identifier, not a handle, so it is
 * dropped here rather than displayed.
 */
export function toSessionUser(payload: unknown): SessionUser | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (typeof record.id !== "string" || record.id.length === 0) return null;

  const creator =
    record.creator && typeof record.creator === "object"
      ? (record.creator as Record<string, unknown>)
      : null;

  const storedHandle =
    typeof creator?.username === "string" ? creator.username.trim() : "";
  const username =
    storedHandle.length > 0 &&
    storedHandle !== record.id &&
    record.requiresOnboarding !== true
      ? storedHandle
      : null;

  return {
    avatarUrl: safeAvatarUrl(creator?.avatarUrl),
    displayName:
      typeof creator?.displayName === "string" && creator.displayName.trim()
        ? creator.displayName.trim()
        : null,
    email: typeof record.email === "string" ? record.email : null,
    emailVerified: record.emailVerified === true,
    id: record.id,
    mode: "live",
    requiresEmailVerification: record.requiresEmailVerification === true,
    requiresOnboarding: record.requiresOnboarding !== false,
    role:
      record.role === "ADMIN" || record.role === "COMPLIANCE_REVIEWER"
        ? record.role
        : "USER",
    username,
  };
}

/**
 * Projects a local preview identity onto the same shape as an API user, so the
 * onboarding pages and the shell do not need a second code path.
 */
export function toPreviewSessionUser(preview: PreviewSession): SessionUser {
  return {
    accountType: preview.accountType,
    contactName: preview.contactName,
    id: `preview_${preview.subject}`,
    email: null,
    emailVerified: false,
    avatarUrl: null,
    displayName: preview.displayName,
    role: "USER",
    username: preview.username,
    // Preview identities never reach the API, so an email gate cannot be
    // satisfied and must not be advertised as a step for them.
    requiresEmailVerification: false,
    requiresOnboarding:
      !preview.accountType || !preview.displayName || !preview.username,
    mode: "preview",
  };
}

/**
 * The signed-in user, resolved from the HttpOnly cookie through the API.
 *
 * Returns `null` for every failure — no cookie, no API configured, a rejected or
 * expired token, a timeout — because an unreachable lookup must never be
 * mistaken for a valid session. Memoised for the render pass so a layout and its
 * pages do not each call the API.
 */
export const readSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (isPreviewAuth()) {
    const preview = await readPreviewSession();
    return preview ? toPreviewSessionUser(preview) : null;
  }

  const token = await readSessionToken();
  if (!token) return null;

  const base = apiBaseUrl();
  if (!base) return null;

  try {
    const response = await fetch(`${base}/auth/me`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(SESSION_LOOKUP_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    return toSessionUser(await response.json());
  } catch {
    return null;
  }
});
