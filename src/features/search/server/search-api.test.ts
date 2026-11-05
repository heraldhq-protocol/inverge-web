import { describe, expect, it } from "vitest";

import {
  mergeHits,
  toCampaignHit,
  toIdeaHit,
} from "@/features/search/server/search-api";

const idea = {
  creator: { displayName: "Amara Okonkwo", username: "amara" },
  id: "idea_1",
  problem: "Farmers lack credit history.",
  slug: "solar-dryer",
  solution: "A shared drying service.",
  status: "VALIDATING",
  title: "Solar dryer cooperative",
};

const campaign = {
  creator: { displayName: "Amara Okonkwo", username: "amara" },
  id: "campaign_1",
  idea: {
    creator: { displayName: "Amara Okonkwo", username: "amara" },
    id: "idea_1",
    problem: "Farmers lack credit history.",
    slug: "solar-dryer",
    solution: "A shared drying service.",
    status: "VALIDATING",
    title: "Solar dryer cooperative",
  },
  status: "ACTIVE",
  summary: "A shared drying service.",
  title: "Solar dryer cooperative",
};

describe("search hit mapping", () => {
  it("builds a public idea path from the API slug and a labelled subtitle", () => {
    const hit = toIdeaHit(idea, false);

    expect(hit).toMatchObject({
      href: "/ideas/solar-dryer",
      id: "idea_1",
      isOwn: false,
      kind: "idea",
      statusLabel: "Validating",
      title: "Solar dryer cooperative",
    });
    expect(hit.subtitle).toBe("Amara Okonkwo · Validating");
  });

  it("routes an own idea to the creator workspace instead of the public page", () => {
    expect(toIdeaHit(idea, true).href).toBe("/d/creator/ideas/idea_1");
  });

  it("uses the source idea slug for a public campaign path", () => {
    expect(toCampaignHit(campaign, false)).toMatchObject({
      href: "/campaigns/solar-dryer",
      kind: "campaign",
      statusLabel: "Funding open",
      title: "Solar dryer cooperative",
    });
  });

  it("routes an own campaign to the creator workspace", () => {
    expect(toCampaignHit(campaign, true).href).toBe(
      "/d/creator/campaigns/campaign_1",
    );
  });

  it("falls back honestly when a campaign has no source idea", () => {
    const hit = toCampaignHit({ ...campaign, idea: null }, false);
    expect(hit.href).toBe("/campaigns/campaign_1");
  });

  it("keeps own hits first and drops the duplicate public copy", () => {
    const own = [toIdeaHit(idea, true)];
    const publicHits = [toIdeaHit(idea, false)];

    const merged = mergeHits(own, publicHits);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.isOwn).toBe(true);
  });
});
