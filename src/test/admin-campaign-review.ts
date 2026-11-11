import type {
  AdminCampaignDetail,
  AdminCampaignQueue,
  CampaignReviewDecision,
} from "@/features/campaigns/lib/admin-campaign-review";

// Synthetic contract fixtures shaped like CampaignReviewService responses.
export function reviewDetailFixture(): AdminCampaignDetail {
  return {
    campaign: {
      id: "campaign-test",
      type: "ALL_OR_NOTHING",
      status: "IN_REVIEW",
      reviewStatus: "IN_REVIEW",
      targetAmount: "25000.25",
      deadline: "2026-12-01T00:00:00.000Z",
      submittedAt: "2026-11-01T10:00:00.000Z",
      reviewedAt: null,
      reviewReason: null,
      creator: {
        id: "creator-test",
        email: "creator@example.test",
        creatorProfile: {
          displayName: "Test Creator",
          username: "test-creator",
        },
        business: null,
      },
      idea: {
        id: "idea-test",
        title: "Water project",
        category: "Technology",
        region: "Lagos",
      },
      _count: { milestones: 1 },
      tokenType: "USDC",
      fundingFloorPct: null,
      workingCapitalPct: "20",
      termsHash: null,
      videoUrl: null,
      videoPosterUrl: null,
      coverImageUrl: null,
      rewardTiers: null,
      ideaSnapshot: {
        title: "Water project",
        problem: "Water shortages",
        solution: "A community pilot",
      },
      launchedAt: null,
      milestones: [
        {
          id: "milestone-test",
          index: 0,
          title: "Pilot",
          deliverable: "Install pilot",
          tranchePct: 100,
          evidenceDefinition: {
            text: "Independent installation report",
            source: "Site inspection",
          },
        },
      ],
    },
    applicationFee: {
      id: "fee-test",
      purpose: "APPLICATION_FEE",
      status: "SUCCEEDED",
      currency: "NGN",
      createdAt: "2026-10-31T12:00:00.000Z",
    },
    preconditions: {
      eligible: true,
      code: null,
      blockers: [],
      checks: [
        {
          key: "identity",
          label: "Identity and AML",
          satisfied: true,
          detail: "Creator verified and screening clear",
        },
        {
          key: "application_fee",
          label: "Application fee",
          satisfied: true,
          detail: "Successful application fee linked to campaign",
        },
      ],
    },
    reviewEvents: [],
  };
}
export function reviewQueueFixture(): AdminCampaignQueue {
  return {
    items: [reviewDetailFixture().campaign],
    total: 1,
    skip: 0,
    take: 50,
    reviewStatus: "IN_REVIEW",
  };
}
export function reviewDecisionFixture(): CampaignReviewDecision {
  return {
    id: "campaign-test",
    reviewStatus: "APPROVED",
    reviewedAt: "2026-11-03T11:00:00.000Z",
    reviewedById: "admin-test",
    reviewReason: null,
    event: {
      id: "event-test",
      action: "APPROVE",
      fromStatus: "IN_REVIEW",
      toStatus: "APPROVED",
      reason: null,
      createdAt: "2026-11-03T11:00:00.000Z",
      actor: { id: "admin-test", email: "admin@example.test", role: "ADMIN" },
    },
  };
}
