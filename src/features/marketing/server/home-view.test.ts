import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/server")>();
  return {
    ...actual,
    fetchApiJson: vi.fn(),
    isApiConfigured: vi.fn(),
  };
});

import { fetchApiJson, isApiConfigured } from "@/lib/api/server";
import type { ApiIdea } from "@/features/ideas/server/live-ideas";
import { previewIdeas } from "@/features/marketing/content/preview-ideas";
import {
  getHomeView,
  loadHomeIdeas,
  loadHomeStats,
  rankHomeIdeas,
  toHomeIdeaCard,
  toHomeStats,
} from "@/features/marketing/server/home-view";
import type { HomeIdeaCard } from "@/features/marketing/types";
import { toDiscoveryIdea } from "@/features/ideas/server/live-ideas";

const fetchMock = vi.mocked(fetchApiJson);
const configuredMock = vi.mocked(isApiConfigured);

function baseIdea(overrides: Partial<ApiIdea> = {}): ApiIdea {
  return {
    askAmount: "10000",
    askBreakdown: { equipment: "4000", training: "6000" },
    category: "software",
    coverImageUrl: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    creator: null,
    currentAlternative: "Spreadsheets.",
    discoverabilityTier: "DISCOVERABLE",
    feedbackCount: 4,
    feedbackScore: "4.50",
    gateProgress: {
      criteria: {
        feedbackCount: { have: 4, need: 10, pct: 0.4, met: false },
        feedbackScore: { have: 4.5, need: 3, pct: 1, met: true },
        supporters: { have: 12, need: 50, pct: 0.24, met: false },
        weightedInterest: { have: 500, need: 2000, pct: 0.25, met: false },
      },
      meetsThreshold: false,
      requiredWeighted: 2000,
    },
    id: "idea-1",
    problem: "Market vendors cannot track stock.",
    promoted: false,
    region: "Lagos, Nigeria",
    risks: null,
    roadmapSteps: [],
    slug: "stock-tracker",
    solution: "A lightweight stock ledger.",
    status: "VALIDATING",
    supporterCount: 12,
    targetUser: "Market vendors",
    taxonomy: { category: "technology", subcategory: "apps" },
    title: "Stock tracker",
    validatingSince: "2026-10-02T00:00:00.000Z",
    weightedPrePledgeTotal: "500",
    ...overrides,
  };
}

function ideaPage(rows: ApiIdea[]) {
  return { data: rows, page: { hasMore: false, nextCursor: null } };
}

function summary(overrides: Record<string, unknown> = {}) {
  return {
    activeCampaigns: 12,
    asOf: "2026-10-26T09:30:00.000Z",
    completedCampaigns: 34,
    publishedIdeas: 128,
    totalCampaigns: 58,
    ...overrides,
  };
}

beforeEach(() => {
  fetchMock.mockReset();
  configuredMock.mockReset();
});

describe("homepage statistics", () => {
  it("maps the platform summary counts", async () => {
    fetchMock.mockResolvedValue(summary());

    const section = await loadHomeStats();

    expect(section).toEqual({
      asOf: "2026-10-26T09:30:00.000Z",
      state: "live",
      stats: {
        activeCampaigns: 12,
        completedCampaigns: 34,
        publishedIdeas: 128,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith("/platform/summary");
  });

  it("is unavailable rather than zero when the API fails", async () => {
    fetchMock.mockRejectedValue(new Error("API down"));

    await expect(loadHomeStats()).resolves.toEqual({ state: "unavailable" });
  });

  it("rejects a malformed counter payload instead of rendering it", () => {
    expect(toHomeStats({ ...summary(), publishedIdeas: "128" })).toBeNull();
    expect(toHomeStats({ ...summary(), activeCampaigns: -1 })).toBeNull();
    expect(toHomeStats({ ...summary(), completedCampaigns: 3.5 })).toBeNull();
  });

  it("falls back to a valid timestamp when asOf is unusable", () => {
    const mapped = toHomeStats(summary({ asOf: "not-a-date" }));

    expect(mapped).not.toBeNull();
    expect(Number.isFinite(Date.parse(mapped!.asOf))).toBe(true);
  });
});

describe("homepage idea cards", () => {
  it("maps the public projection without inventing engagement", () => {
    const card = toHomeIdeaCard(toDiscoveryIdea(baseIdea()));

    expect(card).toMatchObject({
      category: "Technology",
      href: "/ideas/idea-1",
      id: "idea-1",
      pitch: "Market vendors cannot track stock.",
      promoted: false,
      supporters: 12,
      title: "Stock tracker",
    });
    expect(card.estimatedInterest.atomic).toBe("50000");
    expect(card.cover).toBeNull();
  });

  it("puts paid placement first, keeps API order inside each group, and caps the list", () => {
    const cards: HomeIdeaCard[] = [
      { ...previewIdeas[0]!, id: "a", promoted: false },
      { ...previewIdeas[0]!, id: "b", promoted: true },
      { ...previewIdeas[0]!, id: "c", promoted: false },
      { ...previewIdeas[0]!, id: "d", promoted: true },
    ];

    expect(rankHomeIdeas(cards).map((card) => card.id)).toEqual([
      "b",
      "d",
      "a",
    ]);
  });

  it("returns an empty live section when the catalogue is empty", async () => {
    fetchMock.mockResolvedValue(ideaPage([]));

    await expect(loadHomeIdeas()).resolves.toEqual({
      ideas: [],
      state: "live",
    });
  });

  it("never falls back to fixtures when a configured API fails", async () => {
    fetchMock.mockRejectedValue(new Error("API down"));

    const section = await loadHomeIdeas();

    expect(section).toEqual({ state: "unavailable" });
    expect(JSON.stringify(section)).not.toContain("Digital skills");
  });

  it("drops link-only ideas from the editorial cards", async () => {
    fetchMock.mockResolvedValue(
      ideaPage([
        baseIdea({ id: "public-1" }),
        baseIdea({ discoverabilityTier: "LINK_ONLY", id: "private-1" }),
      ]),
    );

    const section = await loadHomeIdeas();

    expect(section.state).toBe("live");
    if (section.state !== "live") return;
    expect(section.ideas.map((card) => card.id)).toEqual(["public-1"]);
  });
});

describe("homepage view assembly", () => {
  it("shows labelled fixtures only when no API is configured", async () => {
    configuredMock.mockReturnValue(false);

    const view = await getHomeView();

    expect(view.stats).toEqual({ state: "preview" });
    expect(view.ideas.state).toBe("preview");
    if (view.ideas.state !== "preview") return;
    expect(view.ideas.ideas).toHaveLength(previewIdeas.length);
    expect(view.ideas.ideas.every((card) => card.href === null)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the idea section usable when only the statistics request fails", async () => {
    configuredMock.mockReturnValue(true);
    fetchMock.mockImplementation((path: string) =>
      path === "/platform/summary"
        ? Promise.reject(new Error("summary down"))
        : Promise.resolve(ideaPage([baseIdea()])),
    );

    const view = await getHomeView();

    expect(view.stats).toEqual({ state: "unavailable" });
    expect(view.ideas.state).toBe("live");
  });

  it("keeps the statistics usable when only the idea request fails", async () => {
    configuredMock.mockReturnValue(true);
    fetchMock.mockImplementation((path: string) =>
      path === "/platform/summary"
        ? Promise.resolve(summary())
        : Promise.reject(new Error("ideas down")),
    );

    const view = await getHomeView();

    expect(view.stats.state).toBe("live");
    expect(view.ideas).toEqual({ state: "unavailable" });
  });
});
