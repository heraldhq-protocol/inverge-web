import { describe, expect, it } from "vitest";

import {
  creativeEligibility,
  placementEligibility,
  rotationBucket,
  selectAdvertisement,
  selectPageAdvertisements,
  viewportForWidth,
} from "@/features/advertising/lib/selection";
import { getAdPlacement } from "@/features/advertising/lib/placements";
import type {
  AdCreative,
  AdFlags,
  AdPageContext,
  AdPlacementId,
  AdSelectionContext,
} from "@/features/advertising/types";

const NOW = "2026-10-22T12:00:00.000Z";
const ENABLED_FLAGS: AdFlags = { enabled: true, thirdPartyEnabled: true };

function creative(overrides: Partial<AdCreative> & { id: string }): AdCreative {
  return {
    advertiser: "Northstar Tools",
    body: "A workspace for small teams that need invoices and receipts together.",
    categories: [],
    createdAt: "2026-10-01T09:00:00.000Z",
    ctaLabel: "See the workspace",
    destination: "https://example.com/northstar",
    endsAt: "2026-12-31T23:59:59.000Z",
    format: "native-card",
    headline: "Run the shop without the spreadsheet",
    kind: "first-party",
    placements: ["campaign-feed-inline"],
    priority: 50,
    regions: [],
    startsAt: "2026-10-01T00:00:00.000Z",
    status: "approved",
    updatedAt: "2026-10-01T09:00:00.000Z",
    ...overrides,
  };
}

function feedCreative(id: string, overrides: Partial<AdCreative> = {}) {
  return creative({ id, ...overrides });
}

function context(
  overrides: Partial<AdSelectionContext> = {},
): AdSelectionContext {
  return {
    consent: { personalisedAds: false },
    flags: ENABLED_FLAGS,
    now: NOW,
    page: { kind: "campaigns", organicResultCount: 6 },
    viewport: "desktop",
    ...overrides,
  };
}

describe("viewportForWidth", () => {
  it("maps the mobile breakpoint up to 639px", () => {
    expect(viewportForWidth(0)).toBe("mobile");
    expect(viewportForWidth(639)).toBe("mobile");
  });

  it("maps the tablet range from 640px to 1023px", () => {
    expect(viewportForWidth(640)).toBe("tablet");
    expect(viewportForWidth(1023)).toBe("tablet");
  });

  it("maps desktop from 1024px", () => {
    expect(viewportForWidth(1024)).toBe("desktop");
    expect(viewportForWidth(2560)).toBe("desktop");
  });
});

describe("rotationBucket", () => {
  it("changes once per UTC day and stays stable within it", () => {
    expect(rotationBucket("2026-10-22T00:00:00.000Z")).toBe(
      rotationBucket("2026-10-22T23:59:59.999Z"),
    );
    expect(rotationBucket("2026-10-22T23:59:59.999Z")).toBe(
      rotationBucket("2026-10-23T00:00:00.000Z") - 1,
    );
  });

  it("treats an unreadable date as the first bucket", () => {
    expect(rotationBucket("not-a-date")).toBe(0);
  });
});

describe("placementEligibility", () => {
  const feed = getAdPlacement("campaign-feed-inline")!;
  const rail = getAdPlacement("campaign-detail-rail")!;
  const thirdParty = getAdPlacement("editorial-third-party")!;

  it("refuses every placement when the master flag is off", () => {
    expect(
      placementEligibility(
        feed,
        context({ flags: { enabled: false, thirdPartyEnabled: false } }),
      ),
    ).toEqual({ eligible: false, reason: "disabled" });
  });

  it("refuses a placement on a page kind it was not declared for", () => {
    expect(
      placementEligibility(feed, context({ page: { kind: "ideas" } })),
    ).toEqual({ eligible: false, reason: "placement-not-allowed" });
  });

  it("refuses a desktop rail in a mobile viewport", () => {
    expect(
      placementEligibility(
        rail,
        context({ page: { kind: "campaign" }, viewport: "mobile" }),
      ),
    ).toEqual({ eligible: false, reason: "viewport-not-eligible" });
  });

  it("refuses a feed card until the organic floor is met", () => {
    expect(
      placementEligibility(
        feed,
        context({ page: { kind: "campaigns", organicResultCount: 5 } }),
      ),
    ).toEqual({ eligible: false, reason: "insufficient-organic-results" });
    expect(
      placementEligibility(feed, context({ page: { kind: "campaigns" } })),
    ).toEqual({ eligible: false, reason: "insufficient-organic-results" });
    expect(
      placementEligibility(
        feed,
        context({ page: { kind: "campaigns", organicResultCount: 6 } }),
      ),
    ).toEqual({ eligible: true });
  });

  it("keeps third-party inventory off until both its flag and consent exist", () => {
    const page: AdPageContext = { kind: "journal" };

    expect(
      placementEligibility(
        thirdParty,
        context({ page, flags: { enabled: true, thirdPartyEnabled: false } }),
      ),
    ).toEqual({ eligible: false, reason: "third-party-disabled" });

    expect(placementEligibility(thirdParty, context({ page }))).toEqual({
      eligible: false,
      reason: "consent-required",
    });

    expect(
      placementEligibility(
        thirdParty,
        context({ consent: { personalisedAds: true }, page }),
      ),
    ).toEqual({ eligible: true });
  });
});

describe("creativeEligibility", () => {
  const feed = getAdPlacement("campaign-feed-inline")!;

  it("accepts an approved, scheduled, relevant creative", () => {
    const result = creativeEligibility(
      feedCreative("northstar-live"),
      feed,
      context(),
    );

    expect(result).toEqual({ eligible: true });
  });

  it("refuses a creative that is not approved", () => {
    for (const status of [
      "draft",
      "paused",
      "pending-review",
      "rejected",
      "ended",
    ] as const) {
      expect(
        creativeEligibility(
          feedCreative(`northstar-${status}`, { status }),
          feed,
          context(),
        ),
      ).toEqual({ eligible: false, reason: "creative-not-approved" });
    }
  });

  it("refuses a creative not booked into this placement", () => {
    expect(
      creativeEligibility(
        feedCreative("northstar-elsewhere", {
          placements: ["idea-feed-inline"],
        }),
        feed,
        context(),
      ),
    ).toEqual({ eligible: false, reason: "placement-not-allowed" });
  });

  it("refuses a format the placement does not render", () => {
    expect(
      creativeEligibility(
        feedCreative("northstar-banner", { format: "banner" }),
        feed,
        context(),
      ),
    ).toEqual({ eligible: false, reason: "format-not-allowed" });
  });

  it("refuses an unsafe destination even when it is approved", () => {
    for (const destination of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "http://example.com/plain",
      "//example.com/protocol-relative",
      "https://user:pass@example.com",
      "",
    ]) {
      expect(
        creativeEligibility(
          feedCreative("northstar-unsafe", { destination }),
          feed,
          context(),
        ),
      ).toEqual({ eligible: false, reason: "destination-invalid" });
    }
  });

  it("matches category and region relevance, with empty meaning everything", () => {
    expect(
      creativeEligibility(
        feedCreative("northstar-category", { categories: ["technology"] }),
        feed,
        context({
          page: {
            category: "technology",
            kind: "campaigns",
            organicResultCount: 6,
          },
        }),
      ),
    ).toEqual({ eligible: true });

    expect(
      creativeEligibility(
        feedCreative("northstar-category", { categories: ["technology"] }),
        feed,
        context({
          page: {
            category: "food-retail",
            kind: "campaigns",
            organicResultCount: 6,
          },
        }),
      ),
    ).toEqual({ eligible: false, reason: "not-relevant" });

    expect(
      creativeEligibility(
        feedCreative("northstar-region", { regions: ["ng"] }),
        feed,
        context({
          page: { kind: "campaigns", organicResultCount: 6, region: "ng" },
        }),
      ),
    ).toEqual({ eligible: true });

    expect(
      creativeEligibility(
        feedCreative("northstar-region", { regions: ["ng"] }),
        feed,
        context({
          page: { kind: "campaigns", organicResultCount: 6, region: "ke" },
        }),
      ),
    ).toEqual({ eligible: false, reason: "not-relevant" });
  });

  it("treats the start as inclusive and the end as exclusive", () => {
    for (const now of [
      "2026-10-01T00:00:00.000Z",
      "2026-12-31T23:59:58.999Z",
    ]) {
      expect(
        creativeEligibility(
          feedCreative("northstar-window"),
          feed,
          context({ now }),
        ),
      ).toEqual({ eligible: true });
    }

    for (const now of [
      "2026-09-30T23:59:59.999Z",
      "2026-12-31T23:59:59.000Z",
    ]) {
      expect(
        creativeEligibility(
          feedCreative("northstar-window"),
          feed,
          context({ now }),
        ),
      ).toEqual({ eligible: false, reason: "not-in-schedule" });
    }
  });

  it("refuses unparseable schedule input rather than guessing", () => {
    expect(
      creativeEligibility(
        feedCreative("northstar-bad-date", { endsAt: "soon" }),
        feed,
        context(),
      ),
    ).toEqual({ eligible: false, reason: "not-in-schedule" });

    expect(
      creativeEligibility(
        feedCreative("northstar-bad-now"),
        feed,
        context({ now: "later" }),
      ),
    ).toEqual({ eligible: false, reason: "not-in-schedule" });
  });

  it("honours the session frequency cap and page exclusion", () => {
    expect(
      creativeEligibility(
        feedCreative("northstar-seen"),
        feed,
        context({ seenCreativeIds: ["northstar-seen"] }),
      ),
    ).toEqual({ eligible: false, reason: "frequency-capped" });

    expect(
      creativeEligibility(
        feedCreative("northstar-placed"),
        feed,
        context({ excludeCreativeIds: ["northstar-placed"] }),
      ),
    ).toEqual({ eligible: false, reason: "excluded" });
  });
});

describe("selectAdvertisement", () => {
  it("returns nothing when the slot cannot appear", () => {
    expect(
      selectAdvertisement(
        [feedCreative("northstar-live")],
        "campaign-feed-inline",
        context({ flags: { enabled: false, thirdPartyEnabled: false } }),
      ),
    ).toBeNull();
  });

  it("returns nothing when no creative passes every rule", () => {
    expect(
      selectAdvertisement([], "campaign-feed-inline", context()),
    ).toBeNull();
    expect(
      selectAdvertisement(
        [feedCreative("northstar-pending", { status: "pending-review" })],
        "campaign-feed-inline",
        context(),
      ),
    ).toBeNull();
  });

  it("prefers the higher priority booking", () => {
    const selection = selectAdvertisement(
      [
        feedCreative("northstar-low", { priority: 10 }),
        feedCreative("northstar-high", { priority: 90 }),
      ],
      "campaign-feed-inline",
      context(),
    );

    expect(selection?.creative.id).toBe("northstar-high");
    expect(selection?.placement.id).toBe("campaign-feed-inline");
  });

  it("is deterministic for the same inputs and rotates between days", () => {
    const candidates = [
      feedCreative("northstar-a", { priority: 50 }),
      feedCreative("northstar-b", { priority: 50 }),
      feedCreative("northstar-c", { priority: 50 }),
    ];
    const first = selectAdvertisement(
      candidates,
      "campaign-feed-inline",
      context(),
    );
    const second = selectAdvertisement(
      candidates,
      "campaign-feed-inline",
      context(),
    );
    expect(first?.creative.id).toBe(second?.creative.id);

    const ids = new Set<string>();
    for (let day = 0; day < 120; day += 1) {
      const now = new Date(Date.UTC(2026, 9, 1 + day, 12)).toISOString();
      const selection = selectAdvertisement(
        candidates,
        "campaign-feed-inline",
        context({ now }),
      );
      ids.add(selection?.creative.id ?? "none");
    }
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe("selectPageAdvertisements", () => {
  it("never exceeds a placement's declared page density", () => {
    const selections = selectPageAdvertisements(
      [feedCreative("northstar-live"), feedCreative("northstar-other")],
      ["campaign-feed-inline", "campaign-feed-inline"],
      context(),
    );

    expect(selections).toHaveLength(1);
    expect(selections[0]?.placement.id).toBe("campaign-feed-inline");
  });

  it("skips a placement that cannot appear instead of inventing a slot", () => {
    const selections = selectPageAdvertisements(
      [feedCreative("northstar-live")],
      ["campaign-feed-inline", "campaign-detail-rail"],
      context({ page: { kind: "campaigns", organicResultCount: 6 } }),
    );

    expect(selections.map((selection) => selection.placement.id)).toEqual([
      "campaign-feed-inline",
    ]);
  });

  it("returns nothing when advertising is disabled", () => {
    expect(
      selectPageAdvertisements(
        [feedCreative("northstar-live")],
        ["campaign-feed-inline"],
        context({ flags: { enabled: false, thirdPartyEnabled: false } }),
      ),
    ).toEqual([]);
  });

  it("keeps the requested reading order across formats", () => {
    const banner = feedCreative("northstar-banner", {
      format: "banner",
      placements: ["content-inline"],
      priority: 10,
    });
    const thirdParty = feedCreative("northstar-third-party", {
      format: "third-party",
      kind: "third-party",
      placements: ["editorial-third-party"],
      priority: 90,
    });

    const selections = selectPageAdvertisements(
      [banner, thirdParty],
      ["content-inline", "editorial-third-party"] as AdPlacementId[],
      context({
        consent: { personalisedAds: true },
        page: { kind: "journal" },
      }),
    );

    expect(selections.map((selection) => selection.placement.id)).toEqual([
      "content-inline",
      "editorial-third-party",
    ]);
  });
});
