import { isAdPlacementId } from "@/features/advertising/lib/placements";
import type { AdPlacementId } from "@/features/advertising/types";

/**
 * Advertising event contract.
 *
 * These events answer four questions: was a labelled placement seen, was its
 * CTA used, was it dismissed, and did the visitor reach the advertiser. They
 * are kept out of campaign analytics on purpose: a paid impression is not a
 * campaign view, and it must never be joined to validation metrics.
 *
 * The parser rejects anything outside the contract rather than coercing it.
 * There is no free-text field, no IP address, and no user agent stored.
 */

export const AD_EVENT_TYPES = [
  "ad_impression",
  "ad_click",
  "ad_dismiss",
  "ad_destination_opened",
] as const;

export type AdEventType = (typeof AD_EVENT_TYPES)[number];

export type AdvertisingEvent = {
  type: AdEventType;
  creativeId: string;
  placementId: AdPlacementId;
  sessionId: string;
  occurredAt: string;
};

export type AdvertisingEventErrorCode =
  "invalid" | "stale" | "future" | "unknown-placement";

export type AdvertisingEventValidation =
  | { ok: true; event: AdvertisingEvent }
  | {
      ok: false;
      code: AdvertisingEventErrorCode;
      message: string;
    };

const SESSION_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const CREATIVE_PATTERN = /^[a-z0-9][a-z0-9-]{2,95}$/;
const MAX_CLOCK_SKEW_MS = 10 * 60 * 1_000;

export function isAdEventType(value: unknown): value is AdEventType {
  return (
    typeof value === "string" &&
    (AD_EVENT_TYPES as readonly string[]).includes(value)
  );
}

function invalid(message: string): AdvertisingEventValidation {
  return { code: "invalid", message, ok: false };
}

/**
 * Validate one client event. `nowIso` is supplied by the route so the rule is
 * testable without freezing the system clock.
 */
export function parseAdvertisingEvent(
  raw: unknown,
  nowIso: string,
): AdvertisingEventValidation {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return invalid("Expected a JSON object.");
  }

  const record = raw as Record<string, unknown>;
  if (!isAdEventType(record.type)) return invalid("Unknown event type.");

  if (
    typeof record.creativeId !== "string" ||
    !CREATIVE_PATTERN.test(record.creativeId)
  ) {
    return invalid("Invalid creative id.");
  }

  if (
    typeof record.placementId !== "string" ||
    !isAdPlacementId(record.placementId)
  ) {
    return {
      code: "unknown-placement",
      message: "Unknown placement.",
      ok: false,
    };
  }

  if (
    typeof record.sessionId !== "string" ||
    !SESSION_PATTERN.test(record.sessionId)
  ) {
    return invalid("Invalid session id.");
  }

  const now = Date.parse(nowIso);
  if (Number.isNaN(now)) return invalid("Invalid server time.");

  const occurredAt =
    record.occurredAt === undefined || record.occurredAt === null
      ? now
      : typeof record.occurredAt === "string"
        ? Date.parse(record.occurredAt)
        : Number.NaN;

  if (Number.isNaN(occurredAt)) return invalid("Invalid event time.");
  if (now - occurredAt > MAX_CLOCK_SKEW_MS) {
    return { code: "stale", message: "Event is too old.", ok: false };
  }
  if (occurredAt - now > MAX_CLOCK_SKEW_MS) {
    return {
      code: "future",
      message: "Event time is in the future.",
      ok: false,
    };
  }

  return {
    event: {
      creativeId: record.creativeId,
      occurredAt: new Date(occurredAt).toISOString(),
      placementId: record.placementId as AdPlacementId,
      sessionId: record.sessionId,
      type: record.type,
    },
    ok: true,
  };
}

/**
 * One accepted event per session, type, creative, and placement.
 *
 * Impressions are already de-duplicated in the browser after a visibility
 * threshold. This key closes the retry/duplicate gap on the server without
 * maintaining an impression ledger (which does not exist yet).
 */
export function advertisingEventDedupeKey(event: AdvertisingEvent): string {
  return [
    event.sessionId,
    event.type,
    event.creativeId,
    event.placementId,
  ].join(":");
}

const BOT_PATTERN =
  /bot|crawler|spider|headless|phantom|curl|wget|python-requests|facebookexternalhit|slurp|bingpreview/i;

/**
 * A user agent hint only. The route also refuses missing agents and treats the
 * signal as one reason to drop an event, never as identity.
 */
export function isLikelyAdvertisingBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.trim().length === 0) return true;
  return BOT_PATTERN.test(userAgent);
}

export type AdvertisingRateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export const AD_EVENT_RATE_LIMIT = 30;
export const AD_EVENT_RATE_WINDOW_MS = 60_000;

/**
 * Fixed-window limiter, scoped by the client's random session id.
 *
 * This is deliberately in-process and best-effort: it stops a single tab from
 * flooding the route, not a distributed attacker. The API takes over when the
 * event sink exists.
 */
export function checkAdvertisingRateLimit(
  buckets: Map<string, { count: number; resetAt: number }>,
  sessionId: string,
  nowMs: number,
): AdvertisingRateLimitResult {
  const existing = buckets.get(sessionId);
  if (!existing || existing.resetAt <= nowMs) {
    buckets.set(sessionId, {
      count: 1,
      resetAt: nowMs + AD_EVENT_RATE_WINDOW_MS,
    });
    return { allowed: true, remaining: AD_EVENT_RATE_LIMIT - 1 };
  }

  if (existing.count >= AD_EVENT_RATE_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - nowMs) / 1_000),
      ),
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: AD_EVENT_RATE_LIMIT - existing.count };
}
