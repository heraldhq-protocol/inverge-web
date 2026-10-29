import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/server")>();
  return {
    ...actual,
    fetchApiJson: vi.fn(),
    isApiConfigured: vi.fn(),
  };
});

import { ApiRequestError, fetchApiJson } from "@/lib/api/server";
import {
  getLiveCampaignDetail,
  getLiveCampaignRecommendations,
  parseRewardTiers,
  parseRoadmapSteps,
  rankLiveCampaigns,
  toLiveCampaignDetail,
  type ApiCampaignDetail,
} from "@/features/campaigns/server/live-campaign-detail";
import {
  campaignHref,
  type LiveCampaign,
} from "@/features/campaigns/server/live-campaigns";

const fetchMock = vi.mocked(fetchApiJson);

function apiCampaign(
  overrides: Partial<ApiCampaignDetail> = {},
): ApiCampaignDetail {
  return {
    coverImageUrl: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    creator: {
      avatarUrl: null,
      bio: null,
      displayName: "Ada Obi",
      id: "user-1",
      username: "ada",
    },
    deadline: "2026-11-01T00:00:00.000Z",
    id: "campaign-1",
    idea: {
      category: "software",
      coverImageUrl: null,
      currentAlternative: "Vendors count stock by hand.",
      id: "idea-1",
      problem: "Market vendors cannot track stock.",
      region: "Lagos, Nigeria",
      risks: "Hardware supply may slip.",
      roadmap: "Pilot in two markets.",
      roadmapSteps: [
        { date: "2026-Q1", description: "Pilot 20 vendors" },
        { date: "2026-Q2", description: "Open to three markets" },
      ],
      slug: "stock-tracker",
      solution: "A lightweight stock ledger.",
      targetUser: "Market vendors in Lagos",
      taxonomyCategorySlug: "technology",
      taxonomySubcategorySlug: "apps",
      title: "Stock tracker",
    },
    ideaId: "idea-1",
    ideaSnapshot: null,
    launchedAt: "2026-10-02T00:00:00.000Z",
    milestoneSummary: { released: 0, total: 0 },
    milestones: [
      {
        deliverable: "Twenty vendors onboarded",
        evidenceDefinition: "Signed onboarding sheets",
        id: "milestone-1",
        index: 0,
        latestClaim: null,
        title: "Pilot",
        tranchePct: 40,
      },
      {
        deliverable: "Ledger synced daily",
        evidenceDefinition: "Seven days of sync logs",
        id: "milestone-2",
        index: 1,
        latestClaim: {
          id: "claim-1",
          objectionWindowEndsAt: "2026-10-20T00:00:00.000Z",
          status: "APPROVED",
          submittedAt: "2026-10-10T00:00:00.000Z",
        },
        title: "Sync",
        tranchePct: 60,
      },
    ],
    rewardTiers: null,
    status: "ACTIVE",
    targetAmount: "10000",
    taxonomy: { category: "technology", subcategory: "apps" },
    totalRaised: "5000",
    videoPosterUrl: null,
    videoUrl: null,
    ...overrides,
  };
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe("live campaign detail mapping", () => {
  it("maps the source idea story and the published milestone plan", () => {
    // #when
    const campaign = toLiveCampaignDetail(apiCampaign());

    // #then
    expect(campaign).not.toBeNull();
    expect(campaign?.slug).toBe("stock-tracker");
    expect(campaign?.slug && campaignHref(campaign)).toBe(
      "/campaigns/stock-tracker",
    );
    expect(campaign?.story).toMatchObject({
      currentAlternative: "Vendors count stock by hand.",
      problem: "Market vendors cannot track stock.",
      risks: "Hardware supply may slip.",
      solution: "A lightweight stock ledger.",
      targetUser: "Market vendors in Lagos",
    });
    expect(campaign?.roadmapSteps).toEqual([
      { date: "2026-Q1", description: "Pilot 20 vendors" },
      { date: "2026-Q2", description: "Open to three markets" },
    ]);
    expect(campaign?.milestonePlan.map((m) => m.state)).toEqual([
      "planned",
      "released",
    ]);
    expect(campaign?.milestonePlan[1]?.objectionWindowEndsAt).toBe(
      "2026-10-20T00:00:00.000Z",
    );
    expect(campaign?.milestones).toEqual({ released: 1, total: 2 });
  });

  it("falls back to the campaign id when there is no source idea slug", () => {
    // #when
    const campaign = toLiveCampaignDetail(
      apiCampaign({ idea: null, ideaId: null, ideaSnapshot: null }),
    );

    // #then
    expect(campaign?.slug).toBe("campaign-1");
    expect(campaign && campaignHref(campaign)).toBe("/campaigns/campaign-1");
    expect(campaign?.story.problem).toBeNull();
  });

  it("never maps a non-public campaign into a public detail view", () => {
    expect(toLiveCampaignDetail(apiCampaign({ status: "DRAFT" }))).toBeNull();
  });

  it("parses only readable reward tiers and flags an unreadable payload", () => {
    // #given
    const valid = {
      amount: "25",
      description: "A signed print",
      estimatedDelivery: "2027-02",
      id: "reward-1",
      limitedQuantity: 10,
      title: "Supporter print",
    };

    // #when
    const parsed = parseRewardTiers([valid, { description: "No title" }]);

    // #then
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      limitedQuantity: 10,
      minimum: { atomic: "2500", currency: "USD" },
      title: "Supporter print",
    });
    expect(parseRewardTiers("not an array")).toEqual([]);
    expect(
      toLiveCampaignDetail(
        apiCampaign({ rewardTiers: [{ title: "No amount" }] }),
      )?.rewardDataState,
    ).toBe("unsupported");
    expect(
      toLiveCampaignDetail(apiCampaign({ rewardTiers: [valid] }))
        ?.rewardDataState,
    ).toBe("available");
    expect(
      toLiveCampaignDetail(apiCampaign({ rewardTiers: null }))?.rewardDataState,
    ).toBe("none");
  });

  it("drops malformed roadmap steps instead of rendering empty rows", () => {
    expect(
      parseRoadmapSteps([
        { date: "2026-Q1", description: "Pilot" },
        { date: "2026-Q2" },
        null,
      ]),
    ).toEqual([{ date: "2026-Q1", description: "Pilot" }]);
  });
});

function liveCampaign(overrides: Partial<LiveCampaign> = {}): LiveCampaign {
  return {
    artwork: "creative",
    cover: null,
    creator: "Ada Obi",
    deadline: "2026-12-01T00:00:00.000Z",
    id: "campaign-1",
    ideaId: "idea-1",
    ideaTitle: "Stock tracker",
    location: "Lagos, Nigeria",
    milestones: { released: 0, total: 2 },
    percentFunded: 50,
    raised: { atomic: "500000", currency: "USD", decimals: 2 },
    slug: "stock-tracker",
    status: "active",
    statusLabel: "Funding open",
    summary: "A ledger.",
    target: { atomic: "1000000", currency: "USD", decimals: 2 },
    taxonomyCategory: "technology",
    taxonomySubcategory: "apps",
    taxonomyText: "Technology / Apps",
    title: "Stock tracker",
    ...overrides,
  };
}

describe("related campaign ranking", () => {
  const source = liveCampaign();

  it("orders shared subcategory first, then open campaigns, then deadline", () => {
    const ranked = rankLiveCampaigns(source, [
      liveCampaign({
        deadline: "2026-11-01T00:00:00.000Z",
        id: "other-category",
        slug: "other-category",
        status: "active",
        taxonomyCategory: "art",
        taxonomySubcategory: "painting",
      }),
      liveCampaign({
        deadline: "2027-01-01T00:00:00.000Z",
        id: "shared-sub-closed",
        slug: "shared-sub-closed",
        status: "completed",
      }),
      liveCampaign({
        deadline: "2026-12-15T00:00:00.000Z",
        id: "shared-sub-open",
        slug: "shared-sub-open",
        status: "active",
      }),
      source,
    ]);

    expect(ranked.map((c) => c.id)).toEqual([
      "shared-sub-open",
      "shared-sub-closed",
      "other-category",
    ]);
  });
});

describe("live campaign detail reads", () => {
  it("returns null for a 404 from the API", async () => {
    // #given
    fetchMock.mockRejectedValue(
      new ApiRequestError("Not found", 404, "NOT_FOUND"),
    );

    // #when
    const view = await getLiveCampaignDetail("missing");

    // #then
    expect(view).toBeNull();
  });

  it("keeps the campaign when the related window fails", async () => {
    // #given
    fetchMock
      .mockResolvedValueOnce(apiCampaign())
      .mockRejectedValueOnce(
        new ApiRequestError("Unreachable", 0, "API_UNREACHABLE"),
      );

    // #when
    const view = await getLiveCampaignDetail("stock-tracker");

    // #then
    expect(view?.campaign.slug).toBe("stock-tracker");
    expect(view?.related).toEqual([]);
    expect(view?.relatedState).toBe("unavailable");
  });

  it("returns the full ranked list for the recommendations route", async () => {
    // #given
    fetchMock.mockResolvedValueOnce(apiCampaign()).mockResolvedValueOnce({
      data: [
        {
          ...apiCampaign(),
          id: "campaign-2",
          idea: {
            ...apiCampaign().idea!,
            id: "idea-2",
            slug: "second-campaign",
          },
        },
        {
          ...apiCampaign(),
          id: "campaign-3",
          idea: {
            ...apiCampaign().idea!,
            id: "idea-3",
            slug: "third-campaign",
          },
          taxonomy: { category: "art", subcategory: "music" },
        },
      ],
      page: { hasMore: false, nextCursor: null },
    });

    // #when
    const view = await getLiveCampaignRecommendations("stock-tracker");

    // #then
    expect(view?.state).toBe("live");
    expect(view?.recommendations.map((c) => c.slug)).toEqual([
      "second-campaign",
      "third-campaign",
    ]);
  });
});
