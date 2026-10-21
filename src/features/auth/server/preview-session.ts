import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";

import {
  type AccountType,
  isAccountType,
} from "@/features/auth/lib/onboarding";

/**
 * A local stand-in for an Inverge session, used only in preview auth mode.
 *
 * The provider token is decoded but **not verified** here, because there is no
 * API to verify it against. This is deliberate and bounded: the payload says
 * "this browser completed a provider sign-in", and it can only unlock the
 * already-labelled preview shell. It is never sent to the API, never used as a
 * bearer token, and never grants a role, tier, wallet, or payment capability.
 *
 * The provider subject is hashed before storage so the cookie does not carry an
 * email address or another readable identifier.
 */
export const PREVIEW_SESSION_COOKIE_NAME = "inverge_preview_session";
export const PREVIEW_SESSION_MAX_AGE_SECONDS = 60 * 60;

export type PreviewSession = {
  v: 1;
  /** SHA-256 of the provider's stable subject, hex encoded. */
  subject: string;
  /** Account shape chosen during onboarding; `null` until it is answered. */
  accountType: AccountType | null;
  /** Public name: the person's name, or the business's trading name. */
  displayName: string | null;
  /** Business only: the person managing the account. Never shown publicly. */
  contactName: string | null;
  username: string | null;
};

type TokenClaims = Record<string, unknown>;

const SUBJECT_PATTERN = /^[a-f0-9]{64}$/;

function decodePayload(idToken: string): TokenClaims | null {
  const part = idToken.split(".")[1];
  if (!part) return null;

  try {
    const json = Buffer.from(part, "base64url").toString("utf8");
    const payload = JSON.parse(json) as unknown;
    return payload && typeof payload === "object"
      ? (payload as TokenClaims)
      : null;
  } catch {
    return null;
  }
}

/**
 * Derives a stable, non-wallet subject from an identity token.
 *
 * Mirrors the API adapter's subject rule so a preview account survives a
 * refresh and a second sign-in with the same provider identity. The wallet
 * address is never used: an address is not an account identity.
 */
export function previewSubjectFromIdToken(idToken: string): string | null {
  const payload = decodePayload(idToken);
  if (!payload) return null;

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  if (
    typeof payload.iat === "number" &&
    payload.iat * 1000 > Date.now() + 60_000
  ) {
    return null;
  }

  const subject = typeof payload.sub === "string" ? payload.sub.trim() : "";
  const authConnection =
    typeof payload.authConnection === "string" ? payload.authConnection : "";
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  const stable =
    subject ||
    (authConnection && userId ? `${authConnection}|${userId}` : "") ||
    (email ? `email|${email}` : "");

  if (!stable) return null;

  return createHash("sha256").update(stable).digest("hex");
}

function parsePreviewSession(value: unknown): PreviewSession | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  if (
    record.v !== 1 ||
    typeof record.subject !== "string" ||
    !SUBJECT_PATTERN.test(record.subject)
  ) {
    return null;
  }

  if (
    record.displayName !== undefined &&
    record.displayName !== null &&
    typeof record.displayName !== "string"
  ) {
    return null;
  }

  if (
    record.contactName !== undefined &&
    record.contactName !== null &&
    typeof record.contactName !== "string"
  ) {
    return null;
  }

  if (
    record.username !== undefined &&
    record.username !== null &&
    typeof record.username !== "string"
  ) {
    return null;
  }

  if (
    record.accountType !== undefined &&
    record.accountType !== null &&
    !isAccountType(record.accountType)
  ) {
    return null;
  }

  // Cookies written before the account-type step existed are still readable;
  // they simply count as incomplete and send the visitor back to the profile.
  return {
    v: 1,
    subject: record.subject,
    accountType: isAccountType(record.accountType) ? record.accountType : null,
    displayName:
      typeof record.displayName === "string" ? record.displayName : null,
    contactName:
      typeof record.contactName === "string" ? record.contactName : null,
    username: typeof record.username === "string" ? record.username : null,
  };
}

function encode(session: PreviewSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export async function readPreviewSession(): Promise<PreviewSession | null> {
  const raw = (await cookies()).get(PREVIEW_SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as unknown;
    return parsePreviewSession(parsed);
  } catch {
    return null;
  }
}

export async function writePreviewSession(
  session: PreviewSession,
): Promise<void> {
  const store = await cookies();

  store.set(PREVIEW_SESSION_COOKIE_NAME, encode(session), {
    httpOnly: true,
    // Preview is disabled in production, but keep the attribute correct if the
    // guard is ever relaxed.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PREVIEW_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearPreviewSession(): Promise<void> {
  const store = await cookies();
  store.delete(PREVIEW_SESSION_COOKIE_NAME);
}
