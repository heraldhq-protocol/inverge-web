import { describe, expect, it } from "vitest";

import { previewAnalytics, type AnalyticsPoint } from "@/features/analytics/content/preview-analytics";
import {
  analyticsWindow,
  parseAnalyticsPeriod,
  recommendIdeaActions,
} from "@/features/analytics/lib/analytics";
import { previewIdeaDetails } from "@/features/ideas/content/preview-details";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { findIdeaById } from "@/features/ideas/lib/catalog";
import type { IdeaDetail } from "@/features/ideas/types";

function series(length: number, start = 10): AnalyticsPoint[] {
  return Array.from({ length }, (_, index) => ({
    date: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    estimatedInterestAtomic: String((start + index) * 100),
    supporters: start + index,
  }));
}

function detail(id: string): IdeaDetail {
  const summary = findIdeaById(ideasPreviewData, id);
  const record = previewIdeaDetails[id];
  if (!summary || !record) throw new Error(`Missing fixture: ${id}`);
  return { ...summary, ...record, cover: record.cover ?? null };
}

describe("parseAnalyticsPeriod", () => {
  it("accepts only the three supported windows", () => {
    expect(parseAnalyticsPeriod("7")).toBe(7);
    expect(parseAnalyticsPeriod("90")).toBe(90);
    expect(parseAnalyticsPeriod("365")).toBe(30);
    expect(parseAnalyticsPeriod(undefined)).toBe(30);
  });
});

describe("analyticsWindow", () => {
  it("returns the selected slice and its change", () => {
    const window = analyticsWindow(series(20), 7);

    expect(window.points).toHaveLength(8);
    expect(window.supporterChange).toBe(7);
    expect(window.interestChangeAtomic).toBe("700");
    expect(window.hasComparison).toBe(true);
    expect(window.previousSupporterChange).toBe(7);
  });

  it("returns null changes when the history does not cover the window", () => {
    const window = analyticsWindow(series(4), 7);

    expect(window.hasComparison).toBe(false);
    expect(window.supporterChange).toBeNull();
    expect(window.previousSupporterChange).toBeNull();
  });

  it("returns empty values for an empty series rather than dividing by zero", () => {
    const window = analyticsWindow([], 30);

    expect(window.points).toEqual([]);
    expect(window.supporterChange).toBeNull();
    expect(window.interestChangeAtomic).toBeNull();
    expect(window.hasComparison).toBe(false);
  });

  it("has a comparable series for the preview idea at 30 days", () => {
    const window = analyticsWindow(previewAnalytics.series, 30);

    expect(window.points.length).toBeGreaterThan(2);
    expect(window.hasComparison).toBe(true);
    expect(window.supporterChange).not.toBeNull();
  });
});

describe("recommendIdeaActions", () => {
  it("names the real gate shortfall for an idea below the threshold", () => {
    const recommendations = recommendIdeaActions(detail("farmlink-coldbox"));

    expect(
      recommendations.some((item) => item.key === "supporters"),
    ).toBe(true);
    expect(recommendations.length).toBeLessThanOrEqual(3);
  });

  it("does not invent a shortfall for an idea that met both thresholds", () => {
    const recommendations = recommendIdeaActions(detail("campus-konekt"));

    expect(recommendations.some((item) => item.key === "supporters")).toBe(false);
    expect(recommendations.some((item) => item.key === "interest")).toBe(false);
    expect(recommendations.some((item) => item.key === "convert")).toBe(true);
  });

  it("asks for structured feedback when none exists", () => {
    const base = detail("campus-konekt");
    const recommendations = recommendIdeaActions({
      ...base,
      feedbackResponses: 0,
    });

    expect(recommendations.some((item) => item.key === "feedback")).toBe(true);
  });
});
