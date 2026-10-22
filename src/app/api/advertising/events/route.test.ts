import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/advertising/events/route";
import { resetAdvertisingIntakeState } from "@/features/advertising/server/event-intake";

const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36";

function request(
  body: string,
  { userAgent = BROWSER as string | null }: { userAgent?: string | null } = {},
): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (userAgent) headers.set("user-agent", userAgent);

  return new Request("https://inverge.africa/api/advertising/events", {
    body,
    headers,
    method: "POST",
  });
}

function payload(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    creativeId: "northstar-live",
    occurredAt: new Date().toISOString(),
    placementId: "campaign-feed-inline",
    sessionId: "session-abcdefghijkl1234",
    type: "ad_impression",
    ...overrides,
  });
}

beforeEach(() => {
  resetAdvertisingIntakeState();
  delete process.env.INVERGE_ADS_ANALYTICS_ENABLED;
});

afterEach(() => {
  delete process.env.INVERGE_ADS_ANALYTICS_ENABLED;
});

describe("POST /api/advertising/events", () => {
  it("is absent when measurement is not enabled", async () => {
    const response = await POST(request(payload()));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      accepted: false,
      persisted: false,
      reason: "not_configured",
    });
  });

  it("accepts a valid event when measurement is enabled", async () => {
    process.env.INVERGE_ADS_ANALYTICS_ENABLED = "true";

    const response = await POST(request(payload()));

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      accepted: true,
      duplicate: false,
      persisted: false,
    });
  });

  it("rejects a bot even when measurement is enabled", async () => {
    process.env.INVERGE_ADS_ANALYTICS_ENABLED = "true";

    const response = await POST(
      request(payload(), { userAgent: "Googlebot/2.1" }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ reason: "rejected" });
  });

  it("rejects a missing user agent", async () => {
    process.env.INVERGE_ADS_ANALYTICS_ENABLED = "true";

    const response = await POST(request(payload(), { userAgent: null }));

    expect(response.status).toBe(403);
  });

  it("rejects malformed JSON", async () => {
    process.env.INVERGE_ADS_ANALYTICS_ENABLED = "true";

    const response = await POST(request("{not-json"));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ reason: "invalid" });
  });

  it("rejects a body over the size cap before parsing", async () => {
    process.env.INVERGE_ADS_ANALYTICS_ENABLED = "true";

    const response = await POST(
      request(payload({ creativeId: "a".repeat(3_000) })),
    );

    expect(response.status).toBe(413);
  });

  it("acknowledges a duplicate retry without claiming persistence", async () => {
    process.env.INVERGE_ADS_ANALYTICS_ENABLED = "true";
    const body = payload();

    const first = await POST(request(body));
    const second = await POST(request(body));

    expect(first.status).toBe(202);
    expect(second.status).toBe(202);
    expect(await second.json()).toEqual({
      accepted: true,
      duplicate: true,
      persisted: false,
    });
  });
});
