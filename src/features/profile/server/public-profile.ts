import "server-only";

import { cache } from "react";

import type {
  PublicProfile,
  PublicProfileIdea,
  PublicProfileLink,
  PublicProfileResult,
  PublicProfileSupportedIdea,
} from "@/features/profile/types";
import { ApiRequestError, fetchApiJson } from "@/lib/api/server";
import { safeAvatarUrl } from "@/lib/public-avatar";

const USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.trunc(value)
    : 0;
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

/**
 * Normalises a route handle to the same closed shape the onboarding form and
 * the API use. A leading `@` is accepted so a pasted handle still resolves.
 */
export function normaliseProfileUsername(raw: string): string | null {
  const candidate = raw.trim().replace(/^@/, "").toLowerCase();
  return USERNAME_PATTERN.test(candidate) ? candidate : null;
}

/**
 * Only a stored, routable handle is public. The API's creator projection can
 * fall back to a derived display-name slug or the internal user id; neither is
 * a username the router should serve.
 */
function isRoutableHandle(handle: string, id: string): boolean {
  return handle !== id && USERNAME_PATTERN.test(handle);
}

/**
 * Profile links are user-authored. Only absolute http(s) URLs are rendered, so
 * a stored `javascript:` or `data:` value can never become a click target.
 */
function safeLinks(value: unknown): PublicProfileLink[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const label = text(entry.label);
    const rawUrl = text(entry.url);
    if (!label || !rawUrl) return [];

    try {
      const url = new URL(rawUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") return [];
      return [{ label: label.slice(0, 80), url: url.toString() }];
    } catch {
      return [];
    }
  });
}

function tier(value: unknown): PublicProfile["tier"] {
  return value === "TRUSTED" || value === "ESTABLISHED" ? value : "STARTER";
}

function toIdea(value: unknown): PublicProfileIdea | null {
  if (!isRecord(value)) return null;

  const id = text(value.id);
  const title = text(value.title);
  if (!id || !title) return null;

  const summary = text(value.problem) ?? text(value.solution) ?? "";
  const publishedAt =
    isoOrNull(value.validatingSince) ?? isoOrNull(value.createdAt) ?? "";

  return {
    href: `/ideas/${encodeURIComponent(id)}`,
    id,
    publishedAt,
    status: text(value.status) ?? "UNKNOWN",
    summary,
    supporters: count(value.supporterCount),
    title,
  };
}

function toSupportedIdea(value: unknown): PublicProfileSupportedIdea | null {
  const idea = toIdea(value);
  if (!idea || !isRecord(value)) return null;

  const creator = isRecord(value.creator) ? value.creator : null;
  const creatorId = creator ? text(creator.id) : null;
  const rawHandle = creator ? text(creator.username)?.toLowerCase() : null;
  const username =
    creatorId && rawHandle && isRoutableHandle(rawHandle, creatorId)
      ? rawHandle
      : null;

  return {
    ...idea,
    creator: {
      displayName: creator ? text(creator.displayName) : null,
      username,
    },
  };
}

/**
 * Projects the API's public-profile payload onto an explicit allowlist.
 *
 * Nothing is spread from the API object: the response carries idea rows and a
 * creator projection, and only the fields a public page may show survive this
 * function. Email, provider ids, KYC facts and moderation fields have no path
 * through it.
 */
export function toPublicProfile(
  payload: unknown,
  requestedUsername: string,
): PublicProfile | null {
  if (!isRecord(payload) || !isRecord(payload.creator)) return null;

  const creator = payload.creator;
  const id = text(creator.id);
  const rawUsername = text(creator.username)?.toLowerCase();
  if (!id || !rawUsername) return null;

  const username = normaliseProfileUsername(rawUsername);
  if (!username || !isRoutableHandle(username, id.toLowerCase())) return null;
  if (username !== requestedUsername) return null;

  const ideas = Array.isArray(payload.ideasPublished)
    ? payload.ideasPublished.flatMap((entry) => {
        const idea = toIdea(entry);
        return idea ? [idea] : [];
      })
    : [];

  const supportedIdeas = Array.isArray(payload.ideasSupported)
    ? payload.ideasSupported.flatMap((entry) => {
        const idea = toSupportedIdea(entry);
        return idea ? [idea] : [];
      })
    : [];

  return {
    avatarUrl: safeAvatarUrl(creator.avatarUrl),
    bio: text(creator.bio),
    completedCampaigns: count(creator.completedCampaigns),
    displayName: text(creator.displayName),
    id,
    ideas,
    // The API's `ideasPublished` count includes drafts. Only the public rows
    // returned by this endpoint are safe to count on a public page.
    ideasPublished: ideas.length,
    identityVerified: creator.identityVerified === true,
    links: safeLinks(creator.links),
    memberSince: isoOrNull(creator.memberSince),
    supportedIdeas,
    tier: tier(creator.tier),
    username,
  };
}

/**
 * The public profile for a handle. `not_found` is a real 404; `unavailable`
 * means the API is missing or unreachable and the page should say so rather
 * than pretending the creator does not exist.
 */
export const getPublicProfile = cache(
  async (rawUsername: string): Promise<PublicProfileResult> => {
    const username = normaliseProfileUsername(rawUsername);
    if (!username) return { status: "not_found" };

    try {
      const payload = await fetchApiJson<unknown>(
        `/auth/creators/${encodeURIComponent(username)}`,
      );
      const profile = toPublicProfile(payload, username);
      return profile ? { profile, status: "found" } : { status: "not_found" };
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 404) return { status: "not_found" };
        if (error.status === 0) return { status: "unavailable" };
      }
      throw error;
    }
  },
);
