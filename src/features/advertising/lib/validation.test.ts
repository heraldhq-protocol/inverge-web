import { describe, expect, it } from "vitest";

import type { AdminActor } from "@/features/admin/permissions";
import {
  AD_BODY_MAX,
  AD_BODY_MIN,
  AD_HEADLINE_MAX,
  AD_HEADLINE_MIN,
  AD_REJECTION_MIN_REASON,
  adActionPermission,
  adActionsFor,
  adInventorySummary,
  adPlacementOptionsForFormat,
  applyAdAction,
  isCreativeApproved,
  isCreativeInSchedule,
  isSafeAdDestination,
  validateAdCreativeInput,
  type AdCreativeInput,
} from "@/features/advertising/lib/validation";
import type {
  AdCreative,
  AdCreativeStatus,
} from "@/features/advertising/types";

const NOW = "2026-10-22T12:00:00.000Z";

const platformAdmin: AdminActor = {
  id: "admin-1",
  name: "Ada",
  role: "platform_admin",
};
const organiser: AdminActor = {
  id: "org-1",
  name: "Bola",
  role: "organiser",
};
const judge: AdminActor = { id: "judge-1", name: "Chidi", role: "judge" };

function input(overrides: Partial<AdCreativeInput> = {}): AdCreativeInput {
  return {
    advertiser: "Northstar Tools",
    body: "A workspace for small teams that need invoices, stock, and receipts.",
    categories: [],
    ctaLabel: "See the workspace",
    destination: "https://example.com/northstar",
    endsAt: "2026-12-31T23:59:59.000Z",
    format: "native-card",
    headline: "Run the shop without the spreadsheet",
    placements: ["campaign-feed-inline"],
    priority: 50,
    regions: [],
    startsAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

function creative(overrides: Partial<AdCreative> = {}): AdCreative {
  const validation = validateAdCreativeInput(input());
  if (!validation.ok) throw new Error("Fixture input must be valid");

  return {
    ...validation.draft,
    createdAt: "2026-10-01T09:00:00.000Z",
    id: "northstar-live",
    status: "approved",
    updatedAt: "2026-10-01T09:00:00.000Z",
    ...overrides,
  };
}

describe("isSafeAdDestination", () => {
  it("accepts https addresses and single-slash Inverge paths", () => {
    expect(isSafeAdDestination("https://example.com/northstar")).toBe(true);
    expect(isSafeAdDestination("https://example.com/a?b=1#c")).toBe(true);
    expect(isSafeAdDestination("/campaigns/sungrid")).toBe(true);
  });

  it("refuses script, data, plain HTTP, protocol-relative, and credential URLs", () => {
    for (const destination of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "http://example.com",
      "//example.com",
      "https://user:secret@example.com",
      "example.com",
      "https://",
      "/\\example.com",
      "/path with spaces",
    ]) {
      expect(isSafeAdDestination(destination)).toBe(false);
    }
  });

  it("refuses empty and overlong destinations", () => {
    expect(isSafeAdDestination("")).toBe(false);
    expect(isSafeAdDestination(`https://example.com/${"a".repeat(500)}`)).toBe(
      false,
    );
  });
});

describe("validateAdCreativeInput", () => {
  it("accepts a complete native booking and normalises it", () => {
    const result = validateAdCreativeInput(
      input({
        categories: ["technology", "technology"],
        placements: ["campaign-feed-inline"],
        regions: ["NG", " ng "],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.draft).toMatchObject({
      categories: ["technology"],
      kind: "first-party",
      placements: ["campaign-feed-inline"],
      priority: 50,
      regions: ["ng"],
      startsAt: "2026-10-01T00:00:00.000Z",
      endsAt: "2026-12-31T23:59:59.000Z",
    });
  });

  it("reports every copy problem at once", () => {
    const result = validateAdCreativeInput(
      input({
        advertiser: "N",
        body: "Short",
        ctaLabel: "x",
        headline: "Tiny",
      }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(Object.keys(result.errors)).toEqual(
      expect.arrayContaining(["advertiser", "headline", "body", "ctaLabel"]),
    );
    expect(result.errors.headline).toContain(String(AD_HEADLINE_MIN));
    expect(result.errors.headline).toContain(String(AD_HEADLINE_MAX));
    expect(result.errors.body).toContain(String(AD_BODY_MIN));
    expect(result.errors.body).toContain(String(AD_BODY_MAX));
  });

  it("refuses copy long enough to impersonate an editorial headline", () => {
    const result = validateAdCreativeInput(
      input({ headline: "h".repeat(AD_HEADLINE_MAX + 1) }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.headline).toBeDefined();
  });

  it("refuses an unsafe destination", () => {
    const result = validateAdCreativeInput(
      input({ destination: "javascript:alert(1)" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.destination).toBeDefined();
  });

  it("refuses an unknown format", () => {
    const result = validateAdCreativeInput(
      input({ format: "full-page-overlay" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.format).toBeDefined();
  });

  it("refuses a format that is not allowed in every chosen placement", () => {
    const result = validateAdCreativeInput(
      input({
        format: "banner",
        placements: ["campaign-feed-inline"],
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.placements).toBeDefined();
  });

  it("refuses no placements, unknown placements, and unknown categories", () => {
    for (const overrides of [
      { placements: [] },
      { placements: ["popup-everywhere"] },
      { categories: ["gambling"] },
    ]) {
      const result = validateAdCreativeInput(input(overrides));
      expect(result.ok).toBe(false);
      if (!result.ok)
        expect(
          result.errors.placements ?? result.errors.categories,
        ).toBeDefined();
    }
  });

  it("refuses a priority outside 0-100 and a non-integer", () => {
    for (const priority of [-1, 101, 1.5, "high"]) {
      const result = validateAdCreativeInput(input({ priority }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.priority).toBeDefined();
    }
  });

  it("refuses an unparseable or backwards schedule", () => {
    const invalidStart = validateAdCreativeInput(input({ startsAt: "soon" }));
    expect(invalidStart.ok).toBe(false);
    if (!invalidStart.ok) expect(invalidStart.errors.startsAt).toBeDefined();

    const backwards = validateAdCreativeInput(
      input({
        endsAt: "2026-10-01T00:00:00.000Z",
        startsAt: "2026-10-02T00:00:00.000Z",
      }),
    );
    expect(backwards.ok).toBe(false);
    if (!backwards.ok) expect(backwards.errors.endsAt).toBeDefined();
  });
});

describe("advertising lifecycle transitions", () => {
  it("maps each status to the actions it actually allows", () => {
    expect(adActionsFor("draft")).toEqual(["submit"]);
    expect(adActionsFor("pending-review")).toEqual(["approve", "reject"]);
    expect(adActionsFor("approved")).toEqual(["pause", "end"]);
    expect(adActionsFor("paused")).toEqual(["resume", "end"]);
    expect(adActionsFor("rejected")).toEqual(["submit"]);
    expect(adActionsFor("ended")).toEqual([]);
  });

  it("keeps approval and rejection behind their own permission", () => {
    expect(adActionPermission("approve")).toBe("advertising:approve");
    expect(adActionPermission("reject")).toBe("advertising:approve");
    expect(adActionPermission("pause")).toBe("advertising:manage");
    expect(adActionPermission("end")).toBe("advertising:manage");
    expect(adActionPermission("submit")).toBe("advertising:manage");
  });

  it("refuses an action the account cannot perform", () => {
    const result = applyAdAction({
      action: "approve",
      actor: organiser,
      at: NOW,
      creative: creative({ status: "pending-review" }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("not-permitted");

    const judgeResult = applyAdAction({
      action: "pause",
      actor: judge,
      at: NOW,
      creative: creative(),
    });
    expect(judgeResult.ok).toBe(false);
    if (!judgeResult.ok) expect(judgeResult.code).toBe("not-permitted");
  });

  it("refuses an action the current status does not allow", () => {
    const result = applyAdAction({
      action: "approve",
      actor: platformAdmin,
      at: NOW,
      creative: creative({ status: "draft" }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("not-allowed");
  });

  it("refuses a rejection without a useful reason", () => {
    const result = applyAdAction({
      action: "reject",
      actor: platformAdmin,
      at: NOW,
      creative: creative({ status: "pending-review" }),
      reason: "No",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("reason-required");
      expect(result.message).toContain(String(AD_REJECTION_MIN_REASON));
    }
  });

  it("approves with an append-only audit event", () => {
    const result = applyAdAction({
      action: "approve",
      actor: platformAdmin,
      at: NOW,
      creative: creative({ status: "pending-review" }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.creative.status).toBe("approved");
    expect(result.creative.updatedAt).toBe(NOW);
    expect(result.event).toMatchObject({
      action: "approve",
      actor: platformAdmin,
      creativeId: "northstar-live",
      from: "pending-review",
      reason: null,
      to: "approved",
    });
  });

  it("records a rejection reason on the audit event", () => {
    const result = applyAdAction({
      action: "reject",
      actor: platformAdmin,
      at: NOW,
      creative: creative({ status: "pending-review" }),
      reason: "Destination does not resolve to a real product page.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.creative.status).toBe("rejected");
    expect(result.event.reason).toBe(
      "Destination does not resolve to a real product page.",
    );
  });

  it("lets an organiser manage a live creative but not approve one", () => {
    const paused = applyAdAction({
      action: "pause",
      actor: organiser,
      at: NOW,
      creative: creative(),
    });
    expect(paused.ok).toBe(true);

    const resumed = applyAdAction({
      action: "resume",
      actor: organiser,
      at: NOW,
      creative: creative({ status: "paused" }),
    });
    expect(resumed.ok).toBe(true);

    const approved = applyAdAction({
      action: "approve",
      actor: organiser,
      at: NOW,
      creative: creative({ status: "pending-review" }),
    });
    expect(approved.ok).toBe(false);
  });
});

describe("advertising schedule and inventory helpers", () => {
  it("only calls approved creatives approved", () => {
    const statuses: readonly AdCreativeStatus[] = [
      "approved",
      "draft",
      "ended",
      "paused",
      "pending-review",
      "rejected",
    ];

    for (const status of statuses) {
      expect(isCreativeApproved(creative({ status }))).toBe(
        status === "approved",
      );
    }
  });

  it("treats the schedule end as exclusive", () => {
    expect(isCreativeInSchedule(creative(), NOW)).toBe(true);
    expect(isCreativeInSchedule(creative({ endsAt: NOW }), NOW)).toBe(false);
    expect(
      isCreativeInSchedule(
        creative({ startsAt: "2026-10-23T00:00:00.000Z" }),
        NOW,
      ),
    ).toBe(false);
  });

  it("counts live, scheduled, pending, paused, and ended inventory", () => {
    const summary = adInventorySummary(
      [
        creative({ id: "live", startsAt: "2026-10-01T00:00:00.000Z" }),
        creative({ id: "scheduled", startsAt: "2026-11-01T00:00:00.000Z" }),
        creative({
          id: "expired",
          endsAt: "2026-10-01T00:00:00.000Z",
          startsAt: "2026-09-01T00:00:00.000Z",
        }),
        creative({ id: "pending", status: "pending-review" }),
        creative({ id: "paused", status: "paused" }),
        creative({ id: "ended", status: "ended" }),
      ],
      NOW,
    );

    expect(summary).toEqual({
      active: 1,
      approved: 3,
      ended: 2,
      paused: 1,
      pending: 1,
      scheduled: 1,
      total: 6,
    });
  });

  it("offers only placements that render the chosen format", () => {
    expect(adPlacementOptionsForFormat("native-card")).toEqual([
      "campaign-feed-inline",
      "idea-feed-inline",
    ]);
    expect(adPlacementOptionsForFormat("third-party")).toEqual([
      "editorial-third-party",
    ]);
    expect(adPlacementOptionsForFormat("sidebar")).toEqual([
      "campaign-detail-rail",
      "idea-detail-rail",
      "content-sidebar",
    ]);
  });
});
