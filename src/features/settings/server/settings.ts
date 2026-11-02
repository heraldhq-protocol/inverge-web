import "server-only";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import {
  readSessionUser,
  type SessionUser,
} from "@/features/auth/server/session-user";
import { settingsPreviewData } from "@/features/settings/content/preview-data";
import {
  emptySettingsData,
  type EmailVerificationChallenge,
  type SettingsData,
  type SettingsRequest,
} from "@/features/settings/types";
import { fetchApiJson } from "@/lib/api/server";
import { safeAvatarUrl } from "@/lib/public-avatar";

const SETTINGS_TIMEOUT_MS = 5_000;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function mapChallenge(value: unknown): EmailVerificationChallenge | null {
  const record = asRecord(value);
  if (!record) return null;
  const purpose = record.purpose === "CHANGE" ? "CHANGE" : "SIGNUP";
  return {
    attemptsRemaining: Math.max(
      0,
      typeof record.attemptsRemaining === "number"
        ? record.attemptsRemaining
        : 0,
    ),
    email: asText(record.email),
    expiresAt: asText(record.expiresAt),
    purpose,
    resendAvailableAt: asText(record.resendAvailableAt),
  };
}

function mapRequests(value: unknown): SettingsRequest[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const type =
      record.type === "ACCOUNT_DELETION" ? "ACCOUNT_DELETION" : "DATA_EXPORT";
    if (typeof record.id !== "string") return [];
    return [
      {
        createdAt: asText(record.createdAt),
        id: record.id,
        status: asText(record.status) || "PENDING",
        type,
      },
    ];
  });
}

/**
 * Maps `GET /me/settings` onto the view contract.
 *
 * Only facts the API returned are used. There is no default email, location, or
 * connection: an absent field stays empty rather than borrowing another user's
 * sample data.
 */
export function mapApiSettings(payload: unknown): SettingsData | null {
  const root = asRecord(payload);
  if (!root) return null;
  const account = asRecord(root.account);
  const profile = asRecord(root.profile);
  const feed = asRecord(root.feed);
  const notifications = asRecord(root.notifications);
  const verification = asRecord(root.verification);
  const wallet = asRecord(root.wallet);
  const email = asText(account?.email);

  return {
    source: "api",
    account: {
      accountType:
        account?.accountType === "BUSINESS"
          ? "BUSINESS"
          : account?.accountType === "INDIVIDUAL"
            ? "INDIVIDUAL"
            : null,
      email: email || null,
      emailVerified: asBoolean(account?.emailVerified, false),
      emailVerifiedAt: asText(account?.emailVerifiedAt) || null,
      memberSince: asText(account?.memberSince) || null,
      role:
        account?.role === "ADMIN" ||
        account?.role === "COMPLIANCE_REVIEWER" ||
        account?.role === "USER"
          ? account.role
          : null,
    },
    connections:
      email.length > 0
        ? [
            {
              actionLabel: asBoolean(account?.emailVerified, false)
                ? "Change"
                : "Verify",
              detail: email,
              id: "email",
              label: "Email address",
              status: asBoolean(account?.emailVerified, false)
                ? "verified"
                : "connected",
            },
          ]
        : [],
    emailChallenge: mapChallenge(root.emailChallenge),
    feed: {
      region: asText(feed?.region) || "global",
      showPromoted: asBoolean(feed?.showPromoted, true),
      topics: asStringArray(feed?.topics),
    },
    notifications: {
      "creator-updates": asBoolean(notifications?.creatorUpdates, true),
      "discovery-digest": asBoolean(notifications?.discoveryDigest, false),
      "email-updates": asBoolean(notifications?.emailUpdates, true),
      "milestone-reviews": asBoolean(notifications?.milestoneReviews, true),
    },
    pendingEmail: asText(root.pendingEmail) || null,
    profile: {
      avatarUrl: safeAvatarUrl(profile?.avatarUrl),
      bio: asText(profile?.bio),
      displayName: asText(profile?.displayName),
      email,
      location: asText(profile?.location),
      username: asText(profile?.username),
    },
    requests: mapRequests(root.requests),
    verification: {
      amlStatus: asText(verification?.amlStatus) || null,
      kycStatus: asText(verification?.kycStatus) || null,
      latestCaseAt: asText(verification?.latestCaseAt) || null,
      latestCaseStatus: asText(verification?.latestCaseStatus) || null,
    },
    wallet: {
      connected: asBoolean(wallet?.connected, false),
      embedded: asBoolean(wallet?.embedded, false),
      provider: asText(wallet?.provider) || null,
    },
  };
}

/**
 * The settings source for the page.
 *
 * - preview auth returns the explicit preview fixture;
 * - live auth reads the API through the HttpOnly session cookie;
 * - an unreachable API returns the signed-in identity only, marked unavailable,
 *   so no preference or verification state is invented.
 */
export async function getSettingsData(): Promise<SettingsData> {
  if (isPreviewAuth()) return settingsPreviewData;

  const [user, token] = await Promise.all([
    readSessionUser(),
    readSessionToken(),
  ]);
  if (!user) return emptySettingsData;
  if (!token) return unavailableFromSession(user);

  try {
    const payload = await fetchApiJson<unknown>("/me/settings", {
      token,
      timeoutMs: SETTINGS_TIMEOUT_MS,
    });
    return mapApiSettings(payload) ?? unavailableFromSession(user);
  } catch {
    return unavailableFromSession(user);
  }
}

function unavailableFromSession(user: SessionUser): SettingsData {
  return {
    ...emptySettingsData,
    account: {
      ...emptySettingsData.account,
      email: user.email,
      role: user.role,
    },
    profile: {
      ...emptySettingsData.profile,
      avatarUrl: user.avatarUrl,
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      username: user.username ?? "",
    },
    source: "unavailable",
  };
}
