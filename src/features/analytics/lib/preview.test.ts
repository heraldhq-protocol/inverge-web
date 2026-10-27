import { describe, expect, it } from "vitest";

import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import { previewAnalyticsWorkspace } from "@/features/analytics/lib/preview";

describe("previewAnalyticsWorkspace", () => {
  it("keeps unmeasured figures null instead of claiming a zero", () => {
    const view = previewAnalyticsWorkspace(
      30,
      new Date("2026-10-26T23:59:59.000Z"),
    );

    expect(view.dataSource).toBe("preview");
    expect(view.premium).toBe(false);
    expect(view.from).toBe("2026-09-27");
    expect(view.to).toBe("2026-10-26");
    expect(view.summary.views).toBeNull();
    expect(view.summary.uniqueSessions).toBeNull();
    expect(view.summary.uniqueSessionsExact).toBe(false);
    expect(view.summary.prePledges).toBeNull();
    expect(view.summary.follows).toBeNull();
    expect(view.summary.saves).toBeNull();
    expect(view.acquisition).toBeNull();
    expect(view.geography).toBeNull();
    expect(view.conversion).toBeNull();
    expect(view.viewSeries).toEqual([]);
  });

  it("carries the fixture idea and its real support figures", () => {
    const view = previewAnalyticsWorkspace(
      7,
      new Date("2026-10-26T00:00:00.000Z"),
    );

    expect(view.idea.id).toBe(previewAnalytics.idea.id);
    expect(view.summary.supporters).toBe(previewAnalytics.idea.supporters);
    expect(view.summary.estimatedInterest).toEqual(
      previewAnalytics.idea.prePledged,
    );
    expect(view.series).toBe(previewAnalytics.series);
    expect(view.activity).toBe(previewAnalytics.activity);
    expect(view.tiers.length).toBeGreaterThan(0);
  });

  it("keeps preview feedback text explicitly available", () => {
    const view = previewAnalyticsWorkspace(7);

    expect(view.feedback?.textAnswersAvailable).toBe(true);
    expect(view.feedback?.responseCount).toBe(
      previewAnalytics.demoSubmissions.length,
    );
  });
});
