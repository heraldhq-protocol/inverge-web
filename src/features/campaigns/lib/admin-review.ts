import type { PillTone } from "@/components/ui/pill";
import { adminCan, type AdminActor } from "@/features/admin/permissions";
import type {
  Campaign,
  CampaignPhase,
  CampaignReview,
} from "@/features/campaigns/types";

/**
 * Campaign curation decisions.
 *
 * The SRS keeps publication, review, funding, and escrow apart. This module
 * keeps the review decision equally narrow: it can decide only a campaign that
 * is actually in review, it records why a creator was refused, and it never
 * treats a client-side preview decision as production authority.
 *
 * FR-304 governs the decision. FR-103 (KYC) and FR-311 (application fee) are
 * preconditions the API must enforce before a campaign reaches this queue; this
 * repository has neither provider, so the preview says so rather than inventing
 * a verification.
 */

export const CAMPAIGN_REVIEW_MIN_REASON = 20;
export const CAMPAIGN_REVIEW_MAX_REASON = 2_000;

export type CampaignReviewAction = "approve" | "request-changes" | "reject";

/** The decision vocabulary in the order a reviewer reads it. */
export const CAMPAIGN_REVIEW_ACTIONS = [
  "approve",
  "request-changes",
  "reject",
] as const satisfies readonly CampaignReviewAction[];

export const campaignReviewActionLabels: Readonly<
  Record<CampaignReviewAction, string>
> = {
  approve: "Approve for funding",
  "request-changes": "Request changes",
  reject: "Reject campaign",
};

export const campaignReviewActionDescriptions: Readonly<
  Record<CampaignReviewAction, string>
> = {
  approve:
    "Accept the listing and open it for funding. Approval is recorded with the reviewer and time.",
  "request-changes":
    "Send the campaign back to the creator with the specific changes required before it can be reviewed again.",
  reject:
    "Refuse the campaign for funding. The reason is shown to the creator and kept in the audit trail.",
};

export const campaignReviewPastLabels: Readonly<
  Record<CampaignReviewAction, string>
> = {
  approve: "Approved for funding",
  "request-changes": "Changes requested",
  reject: "Rejected",
};

export const campaignReviewNextPhases: Readonly<
  Record<CampaignReviewAction, CampaignPhase>
> = {
  approve: "funding",
  "request-changes": "changes-requested",
  reject: "rejected",
};

/** The review state each decision moves the campaign to. */
export const campaignReviewNextStatuses: Readonly<
  Record<CampaignReviewAction, CampaignReview["status"]>
> = {
  approve: "approved",
  "request-changes": "changes-requested",
  reject: "rejected",
};

export const campaignReviewStatusLabels: Readonly<
  Record<CampaignReview["status"], string>
> = {
  approved: "Approved",
  "changes-requested": "Changes requested",
  "in-review": "Awaiting review",
  "not-submitted": "Not submitted",
  rejected: "Rejected",
};

export const campaignReviewStatusTones: Readonly<
  Record<CampaignReview["status"], PillTone>
> = {
  approved: "accent",
  "changes-requested": "warning",
  "in-review": "warning",
  "not-submitted": "neutral",
  rejected: "danger",
};

/**
 * The only persisted shape a browser preview may keep.
 *
 * `review` and `phase` are stored together because a decision changes both. They
 * are still separate values so the UI can show the review outcome without
 * inferring it from the funding phase.
 */
export type CampaignReviewOverride = {
  campaignId: string;
  phase: CampaignPhase;
  review: CampaignReview;
  publishedAt: string | null;
  updatedAt: string;
};

export type CampaignReviewAuditEntry = {
  id: string;
  at: string;
  actor: AdminActor;
  action: CampaignReviewAction;
  campaignId: string;
  campaignTitle: string;
  from: CampaignReview["status"];
  to: CampaignReview["status"];
  reason: string | null;
};

export type CampaignReviewDecision = {
  override: CampaignReviewOverride;
  event: CampaignReviewAuditEntry;
};

export type CampaignReviewDecisionErrorCode =
  "not-permitted" | "not-in-review" | "reason-required" | "reason-too-long";

export type CampaignReviewDecisionResult =
  | { ok: true; decision: CampaignReviewDecision }
  | {
      ok: false;
      code: CampaignReviewDecisionErrorCode;
      message: string;
    };

export type CampaignReviewDecisionInput = {
  action: CampaignReviewAction;
  actor: AdminActor;
  at: string;
  campaign: Campaign;
  eventId: string;
  reason: string;
};

function rejected(
  code: CampaignReviewDecisionErrorCode,
  message: string,
): CampaignReviewDecisionResult {
  return { code, message, ok: false };
}

function nextReview(
  action: CampaignReviewAction,
  at: string,
  reason: string,
): CampaignReview {
  switch (action) {
    case "approve":
      return { approvedAt: at, status: "approved" };
    case "request-changes":
      return { requestedAt: at, status: "changes-requested", summary: reason };
    case "reject":
      return { decidedAt: at, reason, status: "rejected" };
  }
}

/**
 * Decide one review action, or return a typed refusal.
 *
 * This is deliberately pure: the API can use the same rules, and the preview
 * cannot bypass a permission or state check by rendering a different button.
 */
export function decideCampaignReview(
  input: CampaignReviewDecisionInput,
): CampaignReviewDecisionResult {
  const { action, actor, at, campaign, eventId, reason } = input;

  if (!adminCan(actor.role, "campaign:review")) {
    return rejected(
      "not-permitted",
      "This account does not have permission to review campaigns.",
    );
  }

  if (campaign.review.status !== "in-review") {
    return rejected(
      "not-in-review",
      "Only a campaign that is awaiting review can receive a decision.",
    );
  }

  const trimmedReason = reason.trim();
  if (
    action !== "approve" &&
    trimmedReason.length < CAMPAIGN_REVIEW_MIN_REASON
  ) {
    return rejected(
      "reason-required",
      `Give the creator a reason of at least ${CAMPAIGN_REVIEW_MIN_REASON} characters.`,
    );
  }

  if (trimmedReason.length > CAMPAIGN_REVIEW_MAX_REASON) {
    return rejected(
      "reason-too-long",
      `Keep the decision note under ${CAMPAIGN_REVIEW_MAX_REASON.toLocaleString("en-US")} characters.`,
    );
  }

  const next = nextReview(action, at, trimmedReason);
  const phase = campaignReviewNextPhases[action];
  const reasonForRecord = trimmedReason === "" ? null : trimmedReason;

  return {
    decision: {
      event: {
        action,
        actor,
        at,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        from: campaign.review.status,
        id: eventId,
        reason: reasonForRecord,
        to: next.status,
      },
      override: {
        campaignId: campaign.id,
        phase,
        publishedAt:
          action === "approve"
            ? (campaign.publishedAt ?? at)
            : campaign.publishedAt,
        review: next,
        updatedAt: at,
      },
    },
    ok: true,
  };
}

/** Apply a preview decision to a campaign without mutating the fixture. */
export function applyCampaignReviewOverride(
  campaign: Campaign,
  override: CampaignReviewOverride | undefined,
): Campaign {
  if (!override || override.campaignId !== campaign.id) return campaign;

  return {
    ...campaign,
    phase: override.phase,
    publishedAt: override.publishedAt,
    review: override.review,
  };
}

export type CampaignReviewQueueGroup =
  "awaiting-review" | "changes-requested" | "decided" | "not-submitted";

export function campaignReviewQueueGroup(
  review: CampaignReview,
): CampaignReviewQueueGroup {
  switch (review.status) {
    case "in-review":
      return "awaiting-review";
    case "changes-requested":
      return "changes-requested";
    case "approved":
    case "rejected":
      return "decided";
    case "not-submitted":
      return "not-submitted";
  }
}
