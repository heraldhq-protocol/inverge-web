import { describe, expect, it } from "vitest";

import type { AdminActor } from "@/features/admin/permissions";
import {
  applyCampaignReviewOverride,
  CAMPAIGN_REVIEW_MAX_REASON,
  CAMPAIGN_REVIEW_MIN_REASON,
  decideCampaignReview,
  type CampaignReviewAction,
} from "@/features/campaigns/lib/admin-review";
import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import type { Campaign } from "@/features/campaigns/types";

const AT = "2026-10-19T12:00:00.000Z";

const reviewer: AdminActor = {
  id: "admin-1",
  name: "Ada Admin",
  role: "platform_admin",
};

function campaign(id = "campaign-naija-craft"): Campaign {
  const found = previewCampaigns.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing campaign ${id}`);
  return found;
}

function decide(
  action: CampaignReviewAction,
  reason: string,
  overrides: Partial<Parameters<typeof decideCampaignReview>[0]> = {},
) {
  return decideCampaignReview({
    action,
    actor: reviewer,
    at: AT,
    campaign: campaign(),
    eventId: "review-event-1",
    reason,
    ...overrides,
  });
}

describe("campaign review decisions", () => {
  it("approves an in-review campaign and opens funding", () => {
    // #given a submitted campaign and an authorised reviewer
    // #when the reviewer approves it
    const result = decide("approve", "Checked against the curation checklist.");

    // #then the review and phase move together and the audit event is complete
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decision.override.review).toEqual({
      approvedAt: AT,
      status: "approved",
    });
    expect(result.decision.override.phase).toBe("funding");
    expect(result.decision.override.publishedAt).toBe(AT);
    expect(result.decision.event).toMatchObject({
      action: "approve",
      actor: reviewer,
      at: AT,
      campaignId: "campaign-naija-craft",
      from: "in-review",
      id: "review-event-1",
      to: "approved",
    });
  });

  it("requests changes with the reviewer's exact reason", () => {
    // #given a submitted campaign
    // #when the reviewer asks for a specific change
    const reason =
      "Milestone two needs a named evidence counter-signatory and a recording interval.";
    const result = decide("request-changes", reason);

    // #then the creator-visible note and phase are separate from publication
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decision.override.review).toEqual({
      requestedAt: AT,
      status: "changes-requested",
      summary: reason,
    });
    expect(result.decision.override.phase).toBe("changes-requested");
    expect(result.decision.override.publishedAt).toBeNull();
    expect(result.decision.event.reason).toBe(reason);
    expect(result.decision.event.to).toBe("changes-requested");
  });

  it("rejects a campaign with a recorded reason", () => {
    // #given a submitted campaign
    // #when the reviewer rejects it
    const reason =
      "The campaign duplicates an existing listing and provides no independent delivery evidence.";
    const result = decide("reject", reason);

    // #then rejection is a distinct state and the reason survives verbatim
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decision.override.review).toEqual({
      decidedAt: AT,
      reason,
      status: "rejected",
    });
    expect(result.decision.override.phase).toBe("rejected");
    expect(result.decision.event.to).toBe("rejected");
  });

  it("refuses a change request without a meaningful reason", () => {
    // #given a blank note below the minimum length
    // #when the reviewer requests changes
    const result = decide("request-changes", "   Too short   ");

    // #then nothing is written and the error names the requirement
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("reason-required");
    expect(result.message).toContain(String(CAMPAIGN_REVIEW_MIN_REASON));
  });

  it("refuses a rejection without a reason", () => {
    // #given no reason
    // #when the reviewer rejects
    const result = decide("reject", "");

    // #then the decision is refused
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("reason-required");
  });

  it("refuses a note longer than the stored maximum", () => {
    // #given an overlong note
    // #when the reviewer rejects
    const result = decide("reject", "x".repeat(CAMPAIGN_REVIEW_MAX_REASON + 1));

    // #then the note is refused rather than silently truncated
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("reason-too-long");
  });

  it("does not decide a campaign that is not awaiting review", () => {
    // #given a draft campaign
    // #when a decision is attempted
    const result = decide("approve", "", {
      campaign: campaign("campaign-skill-circle"),
    });

    // #then the state guard refuses it
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("not-in-review");
  });

  it("does not decide a campaign twice", () => {
    // #given an approved campaign state
    const approved = decide("approve", "Approved.");
    if (!approved.ok) throw new Error("Fixture approval failed");
    const nextCampaign = applyCampaignReviewOverride(
      campaign(),
      approved.decision.override,
    );

    // #when another decision is attempted
    const second = decide(
      "reject",
      "A second decision must not overwrite the first.",
      {
        campaign: nextCampaign,
      },
    );

    // #then the state guard refuses it
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe("not-in-review");
  });

  it("denies reviewers without campaign:review", () => {
    // #given an organiser and a judge
    // #when either attempts a decision
    const organiser = decide("approve", "", {
      actor: { ...reviewer, role: "organiser" },
    });
    const judge = decide("approve", "", {
      actor: { ...reviewer, role: "judge" },
    });

    // #then both are refused by the domain rule, not only by the UI
    expect(organiser.ok).toBe(false);
    expect(judge.ok).toBe(false);
    if (organiser.ok || judge.ok) return;
    expect(organiser.code).toBe("not-permitted");
    expect(judge.code).toBe("not-permitted");
  });

  it("applies an override without mutating the preview fixture", () => {
    // #given an approved override
    const result = decide("approve", "");
    if (!result.ok) throw new Error("Fixture approval failed");

    // #when it is applied to the campaign
    const merged = applyCampaignReviewOverride(
      campaign(),
      result.decision.override,
    );

    // #then the fixture is unchanged and the merged view is not
    expect(campaign().phase).toBe("in-review");
    expect(campaign().review.status).toBe("in-review");
    expect(merged.phase).toBe("funding");
    expect(merged.review.status).toBe("approved");
  });
});
