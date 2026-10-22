import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getAdSlotView } from "@/features/advertising/server/view";

const NOW = "2026-10-22T12:00:00.000Z";

beforeEach(() => {
  process.env.INVERGE_ADS_ENABLED = "true";
});

afterEach(() => {
  delete process.env.INVERGE_ADS_ENABLED;
  delete process.env.INVERGE_ADS_THIRD_PARTY_ENABLED;
  delete process.env.NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID;
});

describe("getAdSlotView", () => {
  it("returns nothing when the deployment switch is off", () => {
    process.env.INVERGE_ADS_ENABLED = "false";

    expect(
      getAdSlotView({
        now: NOW,
        page: { kind: "campaigns", organicResultCount: 12 },
        placementId: "campaign-feed-inline",
      }),
    ).toBeNull();
  });

  it("returns an approved, in-schedule, published creative", () => {
    const selection = getAdSlotView({
      now: NOW,
      page: { kind: "campaigns", organicResultCount: 12 },
      placementId: "campaign-feed-inline",
    });

    expect(selection?.creative.status).toBe("approved");
    expect(selection?.creative.id).not.toBe("greengrid-expired-2026");
    expect(selection?.placement.id).toBe("campaign-feed-inline");
  });

  it("returns nothing when there are too few organic results", () => {
    expect(
      getAdSlotView({
        now: NOW,
        page: { kind: "campaigns", organicResultCount: 5 },
        placementId: "campaign-feed-inline",
      }),
    ).toBeNull();
  });

  it("returns a rail creative on a campaign detail page", () => {
    const selection = getAdSlotView({
      now: NOW,
      page: { kind: "campaign" },
      placementId: "campaign-detail-rail",
    });

    expect(selection?.placement.id).toBe("campaign-detail-rail");
    expect(selection?.creative.placements).toContain("campaign-detail-rail");
  });

  it("never selects third-party inventory without a consent decision", () => {
    process.env.INVERGE_ADS_THIRD_PARTY_ENABLED = "true";
    process.env.NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID = "ca-pub-123";

    expect(
      getAdSlotView({
        now: NOW,
        page: { kind: "journal" },
        placementId: "editorial-third-party",
      }),
    ).toBeNull();
  });

  it("is stable for the same build timestamp", () => {
    const first = getAdSlotView({
      now: NOW,
      page: { kind: "campaigns", organicResultCount: 12 },
      placementId: "campaign-feed-inline",
    });
    const second = getAdSlotView({
      now: NOW,
      page: { kind: "campaigns", organicResultCount: 12 },
      placementId: "campaign-feed-inline",
    });

    expect(first?.creative.id).toBe(second?.creative.id);
  });
});
