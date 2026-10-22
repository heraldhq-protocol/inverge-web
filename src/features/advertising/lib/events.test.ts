import { describe, expect, it } from "vitest";

import {
  AD_EVENT_RATE_LIMIT,
  AD_EVENT_TYPES,
  advertisingEventDedupeKey,
  checkAdvertisingRateLimit,
  isAdEventType,
  isLikelyAdvertisingBot,
  parseAdvertisingEvent,
} from "@/features/advertising/lib/events";

const NOW = "2026-10-22T12:00:00.000Z";
const SESSION = "session-abcdefghijkl1234";

function event(overrides: Record<string, unknown> = {}) {
  return {
    creativeId: "northstar-live",
    occurredAt: NOW,
    placementId: "campaign-feed-inline",
    sessionId: SESSION,
    type: "ad_impression",
    ...overrides,
  };
}

describe("advertising event contract", () => {
  it("publishes exactly the four documented event types", () => {
    expect(AD_EVENT_TYPES).toEqual([
      "ad_impression",
      "ad_click",
      "ad_dismiss",
      "ad_destination_opened",
    ]);
  });

  it("accepts each documented type", () => {
    for (const type of AD_EVENT_TYPES) {
      expect(isAdEventType(type)).toBe(true);
      expect(parseAdvertisingEvent(event({ type }), NOW).ok).toBe(true);
    }
  });

  it("refuses an undocumented type", () => {
    expect(isAdEventType("ad_revenue")).toBe(false);
    expect(parseAdvertisingEvent(event({ type: "ad_revenue" }), NOW)).toEqual({
      code: "invalid",
      message: "Unknown event type.",
      ok: false,
    });
  });
});

describe("parseAdvertisingEvent", () => {
  it("normalises an accepted event and drops unknown fields", () => {
    const result = parseAdvertisingEvent(
      event({ email: "reader@example.com", ip: "203.0.113.4" }),
      NOW,
    );

    expect(result).toEqual({
      event: {
        creativeId: "northstar-live",
        occurredAt: NOW,
        placementId: "campaign-feed-inline",
        sessionId: SESSION,
        type: "ad_impression",
      },
      ok: true,
    });
    if (result.ok) {
      expect(JSON.stringify(result.event)).not.toContain("reader@example.com");
      expect(JSON.stringify(result.event)).not.toContain("203.0.113.4");
    }
  });

  it("defaults a missing timestamp to server time", () => {
    const result = parseAdvertisingEvent(event({ occurredAt: undefined }), NOW);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.event.occurredAt).toBe(NOW);
  });

  it("refuses a body that is not an object", () => {
    for (const raw of [null, [], "ad_impression", 42]) {
      expect(parseAdvertisingEvent(raw, NOW).ok).toBe(false);
    }
  });

  it("refuses a malformed or oversized creative id", () => {
    for (const creativeId of [
      "",
      "ab",
      "Northstar",
      "../creative",
      "a".repeat(97),
      42,
    ]) {
      expect(parseAdvertisingEvent(event({ creativeId }), NOW).ok).toBe(false);
    }
  });

  it("refuses an undeclared placement", () => {
    const result = parseAdvertisingEvent(
      event({ placementId: "popup-everywhere" }),
      NOW,
    );

    expect(result).toEqual({
      code: "unknown-placement",
      message: "Unknown placement.",
      ok: false,
    });
  });

  it("refuses a session id outside the anonymous format", () => {
    for (const sessionId of [
      "",
      "short",
      "contains spaces here",
      "reader@example.com",
      "a".repeat(65),
    ]) {
      expect(parseAdvertisingEvent(event({ sessionId }), NOW).ok).toBe(false);
    }
  });

  it("refuses stale and future events beyond clock skew", () => {
    const stale = parseAdvertisingEvent(
      event({ occurredAt: "2026-10-22T11:49:59.000Z" }),
      NOW,
    );
    expect(stale).toEqual({
      code: "stale",
      message: "Event is too old.",
      ok: false,
    });

    const future = parseAdvertisingEvent(
      event({ occurredAt: "2026-10-22T12:10:01.000Z" }),
      NOW,
    );
    expect(future).toEqual({
      code: "future",
      message: "Event time is in the future.",
      ok: false,
    });
  });

  it("accepts an event inside the clock-skew window", () => {
    expect(
      parseAdvertisingEvent(
        event({ occurredAt: "2026-10-22T11:55:00.000Z" }),
        NOW,
      ).ok,
    ).toBe(true);
  });

  it("refuses an unparseable timestamp and unparseable server time", () => {
    expect(
      parseAdvertisingEvent(event({ occurredAt: "yesterday" }), NOW).ok,
    ).toBe(false);
    expect(parseAdvertisingEvent(event(), "not-a-date").ok).toBe(false);
  });
});

describe("deduplication", () => {
  it("separates events by session, type, creative, and placement", () => {
    const base = {
      creativeId: "northstar-live",
      occurredAt: NOW,
      placementId: "campaign-feed-inline" as const,
      sessionId: SESSION,
      type: "ad_impression" as const,
    };

    const keys = [
      advertisingEventDedupeKey(base),
      advertisingEventDedupeKey({ ...base, type: "ad_click" }),
      advertisingEventDedupeKey({ ...base, creativeId: "sahel-live" }),
      advertisingEventDedupeKey({ ...base, placementId: "idea-feed-inline" }),
      advertisingEventDedupeKey({
        ...base,
        sessionId: "another-session-12345",
      }),
    ];

    expect(new Set(keys).size).toBe(keys.length);
    expect(advertisingEventDedupeKey(base)).toBe(
      advertisingEventDedupeKey(base),
    );
  });
});

describe("bot rejection", () => {
  it("rejects a missing or empty user agent", () => {
    expect(isLikelyAdvertisingBot(null)).toBe(true);
    expect(isLikelyAdvertisingBot("   ")).toBe(true);
  });

  it("rejects common crawler signatures", () => {
    for (const agent of [
      "Googlebot/2.1",
      "bingbot/2.0",
      "Mozilla/5.0 (compatible; YandexBot/3.0)",
      "curl/8.4.0",
      "python-requests/2.31",
      "HeadlessChrome/120",
      "facebookexternalhit/1.1",
    ]) {
      expect(isLikelyAdvertisingBot(agent)).toBe(true);
    }
  });

  it("accepts an ordinary browser user agent", () => {
    expect(
      isLikelyAdvertisingBot(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
      ),
    ).toBe(false);
  });
});

describe("rate limiting", () => {
  it("allows the configured number of events per session window", () => {
    const buckets = new Map<string, { count: number; resetAt: number }>();
    const start = Date.parse(NOW);

    for (let index = 0; index < AD_EVENT_RATE_LIMIT; index += 1) {
      expect(checkAdvertisingRateLimit(buckets, SESSION, start)).toMatchObject({
        allowed: true,
      });
    }

    const rejected = checkAdvertisingRateLimit(buckets, SESSION, start);
    expect(rejected.allowed).toBe(false);
    if (!rejected.allowed) {
      expect(rejected.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("scopes the window to one session", () => {
    const buckets = new Map<string, { count: number; resetAt: number }>();
    const start = Date.parse(NOW);

    for (let index = 0; index < AD_EVENT_RATE_LIMIT; index += 1) {
      checkAdvertisingRateLimit(buckets, SESSION, start);
    }

    expect(
      checkAdvertisingRateLimit(buckets, "another-session-12345", start),
    ).toEqual({ allowed: true, remaining: AD_EVENT_RATE_LIMIT - 1 });
  });

  it("resets after the window closes", () => {
    const buckets = new Map<string, { count: number; resetAt: number }>();
    const start = Date.parse(NOW);
    checkAdvertisingRateLimit(buckets, SESSION, start);

    expect(checkAdvertisingRateLimit(buckets, SESSION, start + 60_001)).toEqual(
      { allowed: true, remaining: AD_EVENT_RATE_LIMIT - 1 },
    );
  });
});
