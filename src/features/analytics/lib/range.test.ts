import { describe, expect, it } from "vitest";

import {
  analyticsDateRange,
  currentViewSeries,
} from "@/features/analytics/lib/analytics";

function daysInclusive(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  return Math.round((end - start) / 86_400_000) + 1;
}

describe("analyticsDateRange", () => {
  it("returns an inclusive UTC window and the immediately preceding window", () => {
    const range = analyticsDateRange(7, new Date("2026-10-26T23:59:59.000Z"));

    expect(range).toEqual({
      from: "2026-10-20",
      previousFrom: "2026-10-13",
      previousTo: "2026-10-19",
      to: "2026-10-26",
    });
    expect(daysInclusive(range.from, range.to)).toBe(7);
    expect(daysInclusive(range.previousFrom, range.previousTo)).toBe(7);
  });

  it("crosses a month boundary without drifting a day", () => {
    const range = analyticsDateRange(30, new Date("2026-03-01T00:00:00.000Z"));

    expect(range.from).toBe("2026-01-31");
    expect(range.to).toBe("2026-03-01");
    expect(range.previousTo).toBe("2026-01-30");
    expect(daysInclusive(range.from, range.to)).toBe(30);
  });

  it("crosses a year boundary for the 90-day window", () => {
    const range = analyticsDateRange(90, new Date("2026-01-01T12:00:00.000Z"));

    expect(range.to).toBe("2026-01-01");
    expect(daysInclusive(range.from, range.to)).toBe(90);
    expect(daysInclusive(range.previousFrom, range.previousTo)).toBe(90);
  });
});

describe("currentViewSeries", () => {
  it("keeps only buckets on or after the current range start", () => {
    const points = [
      { date: "2026-10-19", value: 1 },
      { date: "2026-10-20", value: 2 },
      { date: "2026-10-21", value: 3 },
    ];

    expect(currentViewSeries(points, "2026-10-20")).toEqual([
      { date: "2026-10-20", value: 2 },
      { date: "2026-10-21", value: 3 },
    ]);
  });

  it("handles ISO timestamps as well as day keys", () => {
    const points = [
      { date: "2026-10-19T00:00:00.000Z", value: 1 },
      { date: "2026-10-20T00:00:00.000Z", value: 2 },
    ];

    expect(currentViewSeries(points, "2026-10-20")).toEqual([
      { date: "2026-10-20T00:00:00.000Z", value: 2 },
    ]);
  });
});
