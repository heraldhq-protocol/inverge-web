import { describe, expect, it } from "vitest";

import {
  adminAnalyticsSchema,
  formatEscrowUsd,
  overviewPeriod,
  overviewRange,
  platformEscrowSchema,
  platformSummarySchema,
} from "@/features/admin/lib/overview";

describe("admin overview report boundaries", () => {
  const summary = {
    asOf: "2026-11-03T10:00:00.000Z",
    publishedIdeas: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalCampaigns: 0,
  };
  const escrow = {
    asOf: summary.asOf,
    heldUsd: "100.25",
    releasedUsd: "0.00",
    refundedUsd: "10.01",
    counts: { active: 1, completed: 0, refunded: 1 },
  };

  it("accepts real zero counts but refuses missing, coerced, or unsafe counts", () => {
    expect(platformSummarySchema.safeParse(summary).success).toBe(true);
    for (const publishedIdeas of [
      undefined,
      null,
      "0",
      -1,
      0.5,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(
        platformSummarySchema.safeParse({ ...summary, publishedIdeas }).success,
      ).toBe(false);
    }
    expect(platformSummarySchema.safeParse(null).success).toBe(false);
  });

  it("requires a real source timestamp rather than inventing freshness", () => {
    for (const asOf of [undefined, "today", "2026-02-30T10:00:00.000Z"]) {
      expect(
        platformSummarySchema.safeParse({ ...summary, asOf }).success,
      ).toBe(false);
    }
  });

  it("rejects malformed or negative financial reports (FR-801–803)", () => {
    expect(platformEscrowSchema.safeParse(escrow).success).toBe(true);
    for (const heldUsd of [
      undefined,
      null,
      -10,
      "-10.00",
      "1e3",
      "1.001",
      "NaN",
      "Infinity",
      "1,000.00",
    ]) {
      expect(
        platformEscrowSchema.safeParse({ ...escrow, heldUsd }).success,
      ).toBe(false);
    }
    expect(
      platformEscrowSchema.safeParse({ ...escrow, counts: {} }).success,
    ).toBe(false);
  });

  it("renders full cents without floating-point conversion (FR-801)", () => {
    expect(formatEscrowUsd("9007199254740993.25")).toBe(
      "$9,007,199,254,740,993.25",
    );
    expect(formatEscrowUsd("0.01")).toBe("$0.01");
    expect(formatEscrowUsd("12.5")).toBe("$12.50");
    expect(formatEscrowUsd("0")).toBe("$0.00");
    expect(() => formatEscrowUsd("12.345")).toThrow();
  });

  it("requires the session precision flag and known, unique resource groups", () => {
    const report = {
      from: "2026-10-05",
      to: "2026-11-03",
      generatedAt: summary.asOf,
      lastAggregatedDay: null,
      totals: { views: 0, uniqueSessions: 0, uniqueSessionsExact: false },
      resources: [],
    };
    expect(adminAnalyticsSchema.safeParse(report).success).toBe(true);
    expect(
      adminAnalyticsSchema.safeParse({
        ...report,
        totals: { views: 0, uniqueSessions: 0 },
      }).success,
    ).toBe(false);
    const row = { resourceType: "IDEA", views: 1, uniqueSessions: 1 };
    expect(
      adminAnalyticsSchema.safeParse({ ...report, resources: [row, row] })
        .success,
    ).toBe(false);
    expect(
      adminAnalyticsSchema.safeParse({
        ...report,
        resources: [{ ...row, resourceType: "UNKNOWN" }],
      }).success,
    ).toBe(false);
  });
});

describe("admin overview date selection", () => {
  it("accepts only a single supported period from the URL", () => {
    expect(overviewPeriod("7")).toBe(7);
    expect(overviewPeriod("90")).toBe(90);
    for (const value of [undefined, "7oops", "-1", "999", ["7", "90"]]) {
      expect(overviewPeriod(value)).toBe(30);
    }
  });

  it("uses inclusive UTC dates across a year boundary", () => {
    expect(overviewRange(7, new Date("2026-01-02T00:30:00.000Z"))).toEqual({
      from: "2025-12-27",
      to: "2026-01-02",
    });
  });
});
