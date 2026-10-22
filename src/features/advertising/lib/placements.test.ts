import { describe, expect, it } from "vitest";

import {
  AD_PLACEMENTS,
  AD_PLACEMENTS_BY_ID,
  AD_PLACEMENT_IDS,
  getAdPlacement,
  isAdPlacementId,
  placementAllowsViewport,
} from "@/features/advertising/lib/placements";

describe("advertising placement registry", () => {
  it("declares every placement exactly once", () => {
    expect(new Set(AD_PLACEMENT_IDS).size).toBe(AD_PLACEMENTS.length);
    expect(AD_PLACEMENT_IDS).toHaveLength(AD_PLACEMENTS.length);
  });

  it("keeps the id lookup in step with the declared list", () => {
    for (const placement of AD_PLACEMENTS) {
      expect(AD_PLACEMENTS_BY_ID[placement.id]).toBe(placement);
      expect(getAdPlacement(placement.id)).toBe(placement);
    }
  });

  it("refuses an id that was never declared", () => {
    expect(getAdPlacement("promo-everywhere")).toBeUndefined();
    expect(isAdPlacementId("promo-everywhere")).toBe(false);
    expect(isAdPlacementId("content-inline")).toBe(true);
  });

  it("gives every placement a page kind, a format, and at least one viewport", () => {
    for (const placement of AD_PLACEMENTS) {
      expect(placement.pageKinds.length).toBeGreaterThan(0);
      expect(placement.formats.length).toBeGreaterThan(0);
      expect(placement.viewports.length).toBeGreaterThan(0);
      expect(placement.maxPerPage).toBe(1);
    }
  });

  it("never mixes a third-party placement into first-party inventory rules", () => {
    for (const placement of AD_PLACEMENTS) {
      if (placement.kind === "third-party") {
        expect(placement.formats).toEqual(["third-party"]);
        expect(placement.requiresConsent).toBe(true);
      } else {
        expect(placement.formats).not.toContain("third-party");
        expect(placement.requiresConsent).toBe(false);
      }
    }
  });

  it("keeps feed placements below an organic-result floor", () => {
    const feedPlacements = AD_PLACEMENTS.filter((placement) =>
      placement.id.endsWith("-feed-inline"),
    );

    expect(feedPlacements).toHaveLength(2);
    for (const placement of feedPlacements) {
      expect(placement.minimumOrganicResults).toBeGreaterThanOrEqual(6);
    }
  });

  it("makes rail placements desktop-only and hides them below lg", () => {
    const rails = AD_PLACEMENTS.filter(
      (placement) => placement.formats[0] === "sidebar",
    );

    expect(rails.length).toBeGreaterThan(0);
    for (const rail of rails) {
      expect(rail.viewports).toEqual(["desktop"]);
      expect(rail.hiddenBelow).toBe("lg");
      expect(placementAllowsViewport(rail, "tablet")).toBe(false);
    }
  });
});
