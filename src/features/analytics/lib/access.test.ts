import { describe, expect, it } from "vitest";

import {
  accessNotice,
  formatAccessDate,
  toAnalyticsAccessView,
} from "@/features/analytics/lib/access";

const BASE = {
  canRequest: true,
  creatorTier: "STARTER" as const,
  decidedAt: null,
  expiresAt: null,
  feature: "analytics.premium",
  premium: false,
  requestedAt: null,
  source: null,
};

describe("premium analytics access projection", () => {
  it("treats an active grant as premium regardless of the request status", () => {
    const view = toAnalyticsAccessView({
      ...BASE,
      premium: true,
      requestStatus: "APPROVED",
    });

    expect(view.status).toBe("premium");
  });

  it.each([
    ["APPROVED", "premium"],
    ["NOT_REQUIRED", "premium"],
    ["PENDING", "pending"],
    ["REJECTED", "rejected"],
    ["EXPIRED", "expired"],
    ["NONE", "available"],
  ] as const)("maps %s to %s", (requestStatus, expected) => {
    const view = toAnalyticsAccessView({ ...BASE, requestStatus });

    expect(view.status).toBe(expected);
  });

  it("never turns a malformed payload into an approval", () => {
    const view = toAnalyticsAccessView({ premium: true });

    expect(view.status).toBe("unavailable");
  });

  it("does not accept a grant for a different feature", () => {
    const view = toAnalyticsAccessView({
      ...BASE,
      feature: "analytics.basic",
      premium: true,
      requestStatus: "APPROVED",
    });

    expect(view.status).toBe("unavailable");
  });

  it("reads only the two notice values the page understands", () => {
    expect(accessNotice("requested")).toBe("requested");
    expect(accessNotice(["error"])).toBe("error");
    expect(accessNotice("approved")).toBeNull();
    expect(accessNotice(undefined)).toBeNull();
  });

  it("formats API instants in UTC and rejects unusable values", () => {
    expect(formatAccessDate("2026-10-25T23:30:00.000Z")).toBe("25 Oct 2026");
    expect(formatAccessDate("not-a-date")).toBeNull();
    expect(formatAccessDate(null)).toBeNull();
  });
});
