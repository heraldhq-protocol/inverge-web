import "server-only";

import {
  advertisingEventDedupeKey,
  checkAdvertisingRateLimit,
  isLikelyAdvertisingBot,
  parseAdvertisingEvent,
} from "@/features/advertising/lib/events";

/**
 * Advertising event intake.
 *
 * The route is a validating boundary, not an analytics pipeline. There is no
 * sink in this build, so every accepted event returns `persisted: false`. The
 * module deliberately never reads an IP address, a cookie, or an account: a
 * random per-tab session id is the only subject, and the user agent is used for
 * a single bot rejection and then discarded.
 */

const DEDUPE_TTL_MS = 6 * 60 * 60 * 1_000;
const MAX_DEDUPE_ENTRIES = 10_000;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const dedupeExpiries = new Map<string, number>();

export type AdvertisingIntakeResponse = {
  accepted: boolean;
  duplicate?: boolean;
  persisted: false;
  reason?: string;
};

export type AdvertisingIntakeResult = {
  status: 202 | 400 | 403 | 404 | 429;
  body: AdvertisingIntakeResponse;
  headers?: Readonly<Record<string, string>>;
};

const NOT_CONFIGURED: AdvertisingIntakeResult = {
  body: { accepted: false, persisted: false, reason: "not_configured" },
  status: 404,
};

const REJECTED_BOT: AdvertisingIntakeResult = {
  body: { accepted: false, persisted: false, reason: "rejected" },
  status: 403,
};

function prune(nowMs: number): void {
  for (const [key, expiresAt] of dedupeExpiries) {
    if (expiresAt <= nowMs) dedupeExpiries.delete(key);
  }
  while (dedupeExpiries.size > MAX_DEDUPE_ENTRIES) {
    const oldest = dedupeExpiries.keys().next().value;
    if (oldest === undefined) break;
    dedupeExpiries.delete(oldest);
  }

  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt <= nowMs) rateBuckets.delete(key);
  }
}

export function ingestAdvertisingEvent(input: {
  enabled: boolean;
  nowIso: string;
  raw: unknown;
  userAgent: string | null;
}): AdvertisingIntakeResult {
  if (!input.enabled) return NOT_CONFIGURED;
  if (isLikelyAdvertisingBot(input.userAgent)) return REJECTED_BOT;

  const parsed = parseAdvertisingEvent(input.raw, input.nowIso);
  if (!parsed.ok) {
    return {
      body: {
        accepted: false,
        persisted: false,
        reason: parsed.code,
      },
      status: 400,
    };
  }

  const nowMs = Date.parse(input.nowIso);
  prune(nowMs);

  const limited = checkAdvertisingRateLimit(
    rateBuckets,
    parsed.event.sessionId,
    nowMs,
  );
  if (!limited.allowed) {
    return {
      body: { accepted: false, persisted: false, reason: "rate_limited" },
      headers: { "Retry-After": String(limited.retryAfterSeconds) },
      status: 429,
    };
  }

  const key = advertisingEventDedupeKey(parsed.event);
  if (dedupeExpiries.has(key)) {
    return {
      body: { accepted: true, duplicate: true, persisted: false },
      status: 202,
    };
  }

  dedupeExpiries.set(key, nowMs + DEDUPE_TTL_MS);

  // No sink exists. The accepted event is intentionally dropped rather than
  // logged, because a log line would be an undisclosed, unretained copy of the
  // same measurement data.
  return {
    body: { accepted: true, duplicate: false, persisted: false },
    status: 202,
  };
}

/** Test-only reset. Server modules keep these maps for the process lifetime. */
export function resetAdvertisingIntakeState(): void {
  rateBuckets.clear();
  dedupeExpiries.clear();
}
