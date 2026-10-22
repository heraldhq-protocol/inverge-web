import { beforeEach, describe, expect, it } from "vitest";

import {
  ingestAdvertisingEvent,
  resetAdvertisingIntakeState,
} from "@/features/advertising/server/event-intake";

const NOW = "2026-10-22T12:00:00.000Z";
const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36";

function payload(overrides: Record<string, unknown> = {}) {
  return {
    creativeId: "northstar-live",
    occurredAt: NOW,
    placementId: "campaign-feed-inline",
    sessionId: "session-abcdefghijkl1234",
    type: "ad_impression",
    ...overrides,
  };
}

function ingest(
  overrides: Partial<Parameters<typeof ingestAdvertisingEvent>[0]> = {},
) {
  return ingestAdvertisingEvent({
    enabled: true,
    nowIso: NOW,
    raw: payload(),
    userAgent: BROWSER,
    ...overrides,
  });
}

beforeEach(() => {
  resetAdvertisingIntakeState();
});

describe("advertising event intake", () => {
  it("reports not configured when the server switch is off", () => {
    const result = ingest({ enabled: false });

    expect(result).toEqual({
      body: { accepted: false, persisted: false, reason: "not_configured" },
      status: 404,
    });
  });

  it("rejects a bot or a missing user agent before parsing", () => {
    for (const userAgent of [null, "", "Googlebot/2.1", "curl/8.4.0"]) {
      const result = ingest({ userAgent });

      expect(result).toEqual({
        body: { accepted: false, persisted: false, reason: "rejected" },
        status: 403,
      });
    }
  });

  it("rejects a malformed event with a stable reason", () => {
    const result = ingest({ raw: payload({ type: "ad_revenue" }) });

    expect(result).toEqual({
      body: { accepted: false, persisted: false, reason: "invalid" },
      status: 400,
    });
  });

  it("reports a stale event distinctly from an invalid one", () => {
    const result = ingest({
      raw: payload({ occurredAt: "2026-10-22T11:00:00.000Z" }),
    });

    expect(result.status).toBe(400);
    expect(result.body.reason).toBe("stale");
  });

  it("accepts a valid event but never claims it was persisted", () => {
    const result = ingest();

    expect(result).toEqual({
      body: { accepted: true, duplicate: false, persisted: false },
      status: 202,
    });
  });

  it("acknowledges a retry as a duplicate without counting it twice", () => {
    expect(ingest().body).toMatchObject({ accepted: true, duplicate: false });
    expect(ingest().body).toMatchObject({ accepted: true, duplicate: true });
  });

  it("separates a second event type for the same creative", () => {
    ingest();
    const click = ingest({ raw: payload({ type: "ad_click" }) });

    expect(click.body).toMatchObject({ accepted: true, duplicate: false });
  });

  it("rate limits one session even when every event is unique", () => {
    for (let index = 0; index < 30; index += 1) {
      expect(
        ingest({ raw: payload({ creativeId: `northstar-${index}` }) }).status,
      ).toBe(202);
    }

    const limited = ingest({ raw: payload({ creativeId: "northstar-over" }) });

    expect(limited.status).toBe(429);
    expect(limited.body).toEqual({
      accepted: false,
      persisted: false,
      reason: "rate_limited",
    });
    expect(limited.headers?.["Retry-After"]).toBeDefined();
  });

  it("keeps the dedupe key per session", () => {
    ingest();
    const other = ingest({
      raw: payload({ sessionId: "another-session-12345" }),
    });

    expect(other.body).toMatchObject({ accepted: true, duplicate: false });
  });
});
