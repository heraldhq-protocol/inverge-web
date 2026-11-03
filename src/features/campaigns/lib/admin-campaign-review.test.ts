import { describe, expect, it } from "vitest";
import {
  reviewDecisionFixture,
  reviewDetailFixture,
  reviewQueueFixture,
} from "@/test/admin-campaign-review";
import {
  adminCampaignDetailSchema,
  adminCampaignQueueSchema,
  campaignReviewDecisionSchema,
  reviewQuery,
  reviewUsd,
} from "./admin-campaign-review";

describe("FR-304 campaign review projections", () => {
  it("reads the actual queue/detail envelopes and structured evidence", () => {
    expect(
      adminCampaignQueueSchema.safeParse(reviewQueueFixture()).success,
    ).toBe(true);
    expect(
      adminCampaignDetailSchema.parse(reviewDetailFixture()).campaign
        .milestones[0]?.evidenceDefinition,
    ).toEqual({
      text: "Independent installation report",
      source: "Site inspection",
    });
    expect(
      adminCampaignQueueSchema.safeParse([reviewDetailFixture().campaign])
        .success,
    ).toBe(false);
    expect(
      adminCampaignDetailSchema.safeParse({
        data: reviewDetailFixture().campaign,
      }).success,
    ).toBe(false);
  });
  it("preserves missing terms and dates without inventing values", () => {
    const raw = reviewDetailFixture();
    raw.campaign.targetAmount = null;
    raw.campaign.deadline = null;
    raw.campaign.submittedAt = null;
    raw.campaign.idea = null;
    expect(adminCampaignDetailSchema.parse(raw)).toEqual(raw);
    expect(reviewUsd(null)).toBe("Not provided");
  });
  it("permits nullable legacy idea metadata", () => {
    const raw = reviewDetailFixture();
    raw.campaign.idea = {
      id: "idea",
      title: "Idea",
      category: null,
      region: null,
    };
    expect(adminCampaignDetailSchema.safeParse(raw).success).toBe(true);
  });
  it("refuses missing or contradictory approval checks", () => {
    const raw = reviewDetailFixture();
    raw.preconditions.checks[0]!.satisfied = false;
    expect(adminCampaignDetailSchema.safeParse(raw).success).toBe(false);
    expect(
      adminCampaignDetailSchema.safeParse({ ...raw, preconditions: undefined })
        .success,
    ).toBe(false);
  });
  it("requires matching decision, actor and event facts", () => {
    expect(
      campaignReviewDecisionSchema.safeParse(reviewDecisionFixture()).success,
    ).toBe(true);
    expect(
      campaignReviewDecisionSchema.safeParse({
        ...reviewDecisionFixture(),
        reviewedById: "someone-else",
      }).success,
    ).toBe(false);
    expect(
      campaignReviewDecisionSchema.safeParse({
        ...reviewDecisionFixture(),
        reviewedAt: "yesterday",
      }).success,
    ).toBe(false);
  });
  it("rejects unknown statuses and malformed financial targets", () => {
    const raw = reviewDetailFixture();
    for (const targetAmount of ["bad", -1, 1500, "100.001"])
      expect(
        adminCampaignDetailSchema.safeParse({
          ...raw,
          campaign: { ...raw.campaign, targetAmount },
        }).success,
      ).toBe(false);
    expect(
      adminCampaignDetailSchema.safeParse({
        ...raw,
        campaign: { ...raw.campaign, reviewStatus: "NEW_STATUS" },
      }).success,
    ).toBe(false);
    expect(reviewUsd("9007199254740993.27")).toBe("$9,007,199,254,740,993.27");
  });
  it("bounds pagination and defaults to awaiting review", () => {
    expect(reviewQuery({})).toEqual({
      reviewStatus: "IN_REVIEW",
      skip: 0,
      take: 50,
    });
    expect(reviewQuery({ reviewStatus: "ALL", skip: "50" })).toEqual({
      reviewStatus: "ALL",
      skip: 50,
      take: 50,
    });
    for (const skip of ["-1", "abc", "99999999999999999", ["50"]])
      expect(reviewQuery({ reviewStatus: "invalid", skip }).skip).toBe(0);
  });
});
