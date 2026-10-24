import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/server")>();
  return { ...actual, fetchApiJson: vi.fn() };
});

import { fetchApiJson } from "@/lib/api/server";
import { campaignPageFromParam } from "@/features/campaigns/lib/live-page";
import {
  getLiveCampaignWindow,
  isReadableCampaign,
  percentFundedFor,
  toLiveCampaign,
  type ApiCampaign,
} from "@/features/campaigns/server/live-campaigns";

const fetchMock = vi.mocked(fetchApiJson);

function baseCampaign(overrides: Partial<ApiCampaign> = {}): ApiCampaign {
  return {
    coverImageUrl: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    creator: {
      displayName: "Ada Obi",
      id: "user-1",
      username: "ada",
    },
    deadline: "2026-11-01T00:00:00.000Z",
    id: "campaign-1",
    idea: {
      category: "software",
      coverImageUrl: null,
      id: "idea-1",
      problem: "Market vendors cannot track stock.",
      region: "Lagos, Nigeria",
      slug: "stock-tracker",
      solution: "A lightweight stock ledger.",
      taxonomyCategorySlug: "technology",
      taxonomySubcategorySlug: "apps",
      title: "Stock tracker",
    },
    ideaId: "idea-1",
    ideaSnapshot: null,
    milestoneSummary: { released: 1, total: 3 },
    status: "ACTIVE",
    targetAmount: "10000",
    taxonomy: { category: "technology", subcategory: "apps" },
    totalRaised: "5000",
    videoPosterUrl: null,
    ...overrides,
  };
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe("live campaign mapping", () => {
  it("maps the public projection without inventing missing fields", () => {
    const campaign = toLiveCampaign(baseCampaign());

    expect(campaign).not.toBeNull();
    expect(campaign?.title).toBe("Stock tracker");
    expect(campaign?.summary).toBe("Market vendors cannot track stock.");
    expect(campaign?.creator).toBe("Ada Obi");
    expect(campaign?.location).toBe("Lagos, Nigeria");
    expect(campaign?.taxonomyText).toBe("Technology / Apps");
    expect(campaign?.status).toBe("active");
    expect(campaign?.statusLabel).toBe("Funding open");
    expect(campaign?.target.atomic).toBe("1000000");
    expect(campaign?.raised.atomic).toBe("500000");
    expect(campaign?.percentFunded).toBe(50);
    expect(campaign?.milestones).toEqual({ released: 1, total: 3 });
    expect(campaign?.ideaId).toBe("idea-1");
  });

  it("maps every public status and rejects a non-public one", () => {
    expect(toLiveCampaign(baseCampaign({ status: "FUNDED" }))?.status).toBe(
      "funded",
    );
    expect(toLiveCampaign(baseCampaign({ status: "FAILED" }))?.status).toBe(
      "failed",
    );
    expect(toLiveCampaign(baseCampaign({ status: "COMPLETED" }))?.status).toBe(
      "completed",
    );
    expect(isReadableCampaign(baseCampaign({ status: "DRAFT" }))).toBe(false);
    expect(toLiveCampaign(baseCampaign({ status: "DRAFT" }))).toBeNull();
  });

  it("falls back to the source idea taxonomy when the campaign row has none", () => {
    const campaign = toLiveCampaign(
      baseCampaign({
        taxonomy: null,
        idea: {
          ...baseCampaign().idea!,
          taxonomyCategorySlug: "food",
          taxonomySubcategorySlug: "farms",
        },
      }),
    );

    expect(campaign?.taxonomyCategory).toBe("food");
    expect(campaign?.taxonomySubcategory).toBe("farms");
    expect(campaign?.artwork).toBe("food");
  });

  it("keeps a valid parent but drops a child that does not belong to it", () => {
    const campaign = toLiveCampaign(
      baseCampaign({
        taxonomy: { category: "art", subcategory: "apps" },
      }),
    );

    expect(campaign?.taxonomyCategory).toBe("art");
    expect(campaign?.taxonomySubcategory).toBeNull();
    expect(campaign?.taxonomyText).toBe("Art");
  });

  it("shows an honest uncategorised label and no source link", () => {
    const campaign = toLiveCampaign(
      baseCampaign({
        idea: null,
        ideaId: null,
        taxonomy: null,
        ideaSnapshot: {
          problem: "Snapshot problem.",
          title: "Snapshot campaign",
        },
      }),
    );

    expect(campaign?.title).toBe("Snapshot campaign");
    expect(campaign?.summary).toBe("Snapshot problem.");
    expect(campaign?.taxonomyText).toBe("Uncategorised");
    expect(campaign?.ideaId).toBeNull();
    expect(campaign?.location).toBe("Location not shared");
  });

  it("computes percentages in integer maths and handles a zero target", () => {
    expect(percentFundedFor("15000", "10000")).toBe(150);
    expect(percentFundedFor("0", "10000")).toBe(0);
    expect(percentFundedFor("100", "0")).toBe(0);
  });

  it("does not borrow a video poster when a cover exists", () => {
    const campaign = toLiveCampaign(
      baseCampaign({
        coverImageUrl: "https://example.test/cover.jpg",
        videoPosterUrl: "https://example.test/poster.jpg",
      }),
    );

    expect(campaign?.cover).toBe("https://example.test/cover.jpg");
  });
});

describe("live category page parsing", () => {
  it("accepts a positive integer and falls back for everything else", () => {
    expect(campaignPageFromParam("3")).toBe(3);
    expect(campaignPageFromParam(["4", "5"])).toBe(4);
    expect(campaignPageFromParam(undefined)).toBe(1);
    expect(campaignPageFromParam("0")).toBe(1);
    expect(campaignPageFromParam("-2")).toBe(1);
    expect(campaignPageFromParam("2.5")).toBe(1);
    expect(campaignPageFromParam("nope")).toBe(1);
  });
});

describe("live campaign reads", () => {
  it("follows cursors until the API runs out", async () => {
    fetchMock
      .mockResolvedValueOnce({
        data: [baseCampaign({ id: "a" })],
        page: { hasMore: true, nextCursor: "next" },
      })
      .mockResolvedValueOnce({
        data: [baseCampaign({ id: "b" })],
        page: { hasMore: false, nextCursor: null },
      });

    const window = await getLiveCampaignWindow({
      category: "technology",
      max: 50,
    });

    expect(window.campaigns.map((campaign) => campaign.id)).toEqual([
      "a",
      "b",
    ]);
    expect(window.truncated).toBe(false);
  });

  it("reports truncation when the cap is reached before the API ends", async () => {
    fetchMock.mockResolvedValue({
      data: Array.from({ length: 50 }, (_, index) =>
        baseCampaign({ id: `campaign-${index}` }),
      ),
      page: { hasMore: true, nextCursor: "next" },
    });

    const window = await getLiveCampaignWindow({
      category: "technology",
      max: 50,
    });

    expect(window.campaigns).toHaveLength(50);
    expect(window.truncated).toBe(true);
  });

  it("handles an empty first page", async () => {
    fetchMock.mockResolvedValue({
      data: [],
      page: { hasMore: false, nextCursor: null },
    });

    await expect(
      getLiveCampaignWindow({ category: "technology" }),
    ).resolves.toEqual({ campaigns: [], truncated: false });
  });

  it("propagates an API failure instead of returning fixtures", async () => {
    fetchMock.mockRejectedValue(new Error("API down"));

    await expect(
      getLiveCampaignWindow({ category: "technology" }),
    ).rejects.toThrow("API down");
  });
});
