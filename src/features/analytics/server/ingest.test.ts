import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isAnalyticsIngestConfigured,
  parseAnalyticsSource,
  signAnalyticsBody,
} from "@/features/analytics/server/ingest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe("server analytics ingest", () => {
  it("signs the timestamp and raw body with HMAC-SHA256", () => {
    // Fixed vector: changing the signing input, encoding, or digest would make
    // every signed ingest request fail with INVALID_ANALYTICS_SIGNATURE.
    expect(
      signAnalyticsBody(
        "a-secret-that-is-at-least-32-characters",
        "1792500000",
        '{"events":[]}',
      ),
    ).toBe("abff1cf53d16ac4d7fa1b9919d396c5e5322d17ca8316c5d2761ed100d9aa3a6");
  });

  it("only enables ingest with an explicit switch, a strong secret, and an API", () => {
    process.env.INVERGE_ANALYTICS_ENABLED = "true";
    process.env.INVERGE_API_URL = "http://127.0.0.1:3001";
    process.env.INVERGE_ANALYTICS_INGEST_SECRET = "short";

    expect(isAnalyticsIngestConfigured()).toBe(false);

    process.env.INVERGE_ANALYTICS_INGEST_SECRET =
      "local-analytics-ingest-secret-000000000000";
    expect(isAnalyticsIngestConfigured()).toBe(true);

    process.env.INVERGE_ANALYTICS_ENABLED = "false";
    expect(isAnalyticsIngestConfigured()).toBe(false);
  });

  it("maps only the closed source vocabulary, defaulting to direct", () => {
    expect(parseAnalyticsSource("feed")).toBe("feed");
    expect(parseAnalyticsSource("search")).toBe("search");
    expect(parseAnalyticsSource("internal")).toBe("internal");
    expect(parseAnalyticsSource("https://example.com")).toBe("direct");
    expect(parseAnalyticsSource(undefined)).toBe("direct");
  });
});
