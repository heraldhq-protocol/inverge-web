import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/server")>();
  return { ...actual, fetchApiJson: vi.fn() };
});

import { fetchApiJson } from "@/lib/api/server";
import {
  discoveryCategoryFor,
  getLiveIdea,
  getLiveIdeasWindow,
  isReadableIdea,
  regionFor,
  toAskBreakdown,
  toDiscoveryIdea,
  toIdeaDetail,
  toRoadmapSteps,
  validationPercentFor,
  type ApiIdea,
} from "@/features/ideas/server/live-ideas";

const fetchMock = vi.mocked(fetchApiJson);

function baseIdea(overrides: Partial<ApiIdea> = {}): ApiIdea {
  return {
    askAmount: "1000",
    askBreakdown: { equipment: "400", marketing: "100" },
    category: "software",
    coverImageUrl: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    creator: {
      bio: "Builds tools for markets.",
      displayName: "Ada Obi",
      id: "user-1",
      identityVerified: true,
      username: "ada",
    },
    currentAlternative: "Spreadsheets",
    discoverabilityTier: "DISCOVERABLE",
    feedbackCount: 4,
    feedbackScore: "3.5",
    gateProgress: {
      criteria: {
        feedbackCount: { have: 4, met: false, need: 10, pct: 0.4 },
        feedbackScore: { have: 3.5, met: false, need: 4, pct: 0.875 },
        supporters: { have: 12, met: false, need: 40, pct: 0.3 },
        weightedInterest: { have: 200, met: false, need: 1000, pct: 0.2 },
      },
      meetsThreshold: false,
      requiredWeighted: 1000,
    },
    id: "idea-1",
    problem: "Market vendors cannot track stock.",
    promoted: false,
    region: "Lagos, Nigeria",
    risks: "Hardware supply is seasonal.",
    roadmapSteps: [
      { date: "Nov 2026", description: "Pilot with ten vendors." },
      { date: "", description: "Ignored." },
      { date: "Dec 2026" },
    ],
    slug: "stock-tracker",
    solution: "A lightweight stock ledger.",
    status: "VALIDATING",
    supporterCount: 12,
    targetUser: "Market vendors",
    taxonomy: { category: "technology", subcategory: "apps" },
    title: "Stock tracker",
    validatingSince: "2026-10-02T00:00:00.000Z",
    weightedPrePledgeTotal: "250.5",
    ...overrides,
  };
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe("live idea mapping", () => {
  it("maps API money, taxonomy, region and gate progress", () => {
    const idea = toDiscoveryIdea(baseIdea());

    expect(idea.prePledged).toEqual({
      atomic: "25050",
      currency: "USD",
      decimals: 2,
    });
    expect(idea.category).toBe("Technology");
    expect(idea.taxonomyCategory).toBe("technology");
    expect(idea.taxonomySubcategory).toBe("apps");
    expect(idea.discoveryCategory).toBe("technology");
    expect(idea.region).toBe("nigeria");
    expect(idea.location).toBe("Lagos, Nigeria");
    expect(idea.creator).toBe("Ada Obi");
    expect(idea.creatorInitials).toBe("AO");
    expect(idea.validationPercent).toBe(20);
    expect(idea.visibility).toBe("public");
  });

  it("uses the lowest gate criterion rather than an average", () => {
    expect(validationPercentFor(baseIdea().gateProgress)).toBe(20);

    const gate = baseIdea().gateProgress;
    for (const criterion of Object.values(gate.criteria)) {
      criterion.pct = 1.4;
    }
    expect(validationPercentFor(gate)).toBe(100);
  });

  it("maps regions outside the supported list to other", () => {
    expect(regionFor("Accra, Ghana")).toBe("ghana");
    expect(regionFor("Dakar")).toBe("senegal");
    expect(regionFor("Nairobi, Kenya")).toBe("other");
    expect(regionFor(null)).toBe("other");
  });

  it("prefers the legacy category for the six-value discovery bucket", () => {
    expect(discoveryCategoryFor("agriculture", "food")).toBe("agriculture");
    expect(discoveryCategoryFor("unknown", "food")).toBe("food-retail");
    expect(discoveryCategoryFor("unknown", undefined)).toBe("creative");
  });

  it("keeps LINK_ONLY readable but private and rejects DRAFT", () => {
    const linkOnly = baseIdea({ discoverabilityTier: "LINK_ONLY" });
    expect(isReadableIdea(linkOnly)).toBe(true);
    expect(toDiscoveryIdea(linkOnly).visibility).toBe("private");

    expect(isReadableIdea(baseIdea({ status: "DRAFT" }))).toBe(false);
  });

  it("builds detail fields only from values the API sent", () => {
    const detail = toIdeaDetail(baseIdea());

    expect(detail.askAmount.atomic).toBe("100000");
    expect(detail.askBreakdown.map((item) => item.label)).toEqual([
      "Equipment",
      "Marketing",
    ]);
    expect(detail.creatorBio).toBe("Builds tools for markets.");
    expect(detail.creatorVerified).toBe(true);
    expect(detail.roadmapSteps).toEqual([
      { date: "Nov 2026", description: "Pilot with ten vendors." },
    ]);
    expect(detail.publishedAt).toBe("2026-10-02T00:00:00.000Z");
    expect(detail.fundingIntent?.nextStep).toContain("validation gate");
  });

  it("omits an ask breakdown with no numeric entries", () => {
    expect(toAskBreakdown(null)).toEqual([]);
    expect(toAskBreakdown({ note: "not a number" })).toEqual([]);
    expect(toRoadmapSteps({ date: "soon" })).toEqual([]);
  });

  it("does not invent a funding intent when the ask is zero", () => {
    const detail = toIdeaDetail(baseIdea({ askAmount: "0" }));
    expect(detail.fundingIntent).toBeUndefined();
  });
});

describe("live idea reads", () => {
  it("follows cursors until the API runs out", async () => {
    fetchMock
      .mockResolvedValueOnce({
        data: [baseIdea({ id: "a" })],
        page: { hasMore: true, nextCursor: "next" },
      })
      .mockResolvedValueOnce({
        data: [baseIdea({ id: "b" })],
        page: { hasMore: false, nextCursor: null },
      });

    const window = await getLiveIdeasWindow({ max: 50 });

    expect(window.ideas.map((idea) => idea.id)).toEqual(["a", "b"]);
    expect(window.truncated).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports truncation when the cap is reached before the API ends", async () => {
    fetchMock.mockResolvedValue({
      data: Array.from({ length: 50 }, (_, index) =>
        baseIdea({ id: `idea-${index}` }),
      ),
      page: { hasMore: true, nextCursor: "next" },
    });

    const window = await getLiveIdeasWindow({ max: 50 });

    expect(window.ideas).toHaveLength(50);
    expect(window.truncated).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("handles an empty first page", async () => {
    fetchMock.mockResolvedValue({
      data: [],
      page: { hasMore: false, nextCursor: null },
    });

    await expect(getLiveIdeasWindow()).resolves.toEqual({
      ideas: [],
      truncated: false,
    });
  });

  it("propagates an API failure instead of returning fixtures", async () => {
    fetchMock.mockRejectedValue(new Error("API down"));

    await expect(getLiveIdeasWindow()).rejects.toThrow("API down");
  });

  it("returns null for a missing idea and rethrows other failures", async () => {
    fetchMock.mockRejectedValueOnce(
      Object.assign(new Error("not found"), { status: 404 }),
    );
    await expect(getLiveIdea("missing")).resolves.toBeNull();

    fetchMock.mockRejectedValueOnce(new Error("API down"));
    await expect(getLiveIdea("idea-1")).rejects.toThrow("API down");
  });

  it("hides a DRAFT fetched by direct id", async () => {
    fetchMock.mockResolvedValue(baseIdea({ status: "DRAFT" }));
    await expect(getLiveIdea("idea-1")).resolves.toBeNull();
  });
});
