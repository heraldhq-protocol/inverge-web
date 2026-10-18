import { contributionsForCampaign } from "@/features/campaigns/content/preview-contributions";
import {
  previewCampaigns,
  viewerCampaignIds,
} from "@/features/campaigns/content/preview-campaigns";
import {
  currentMilestone,
  escrowLedger,
  milestoneProgress,
  milestoneTranche,
  type EscrowLedger,
} from "@/features/campaigns/lib/milestones";
import { campaignsDataSource } from "@/features/campaigns/server/campaigns";
import type {
  Campaign,
  CampaignMilestone,
  CampaignPhase,
  CreatorCampaignSummary,
  CreatorEscrowSummary,
  DataSource,
  MilestoneWorkload,
} from "@/features/campaigns/types";
import { sumMoneyAmounts, type MoneyAmount } from "@/lib/money";

/**
 * Creator reads.
 *
 * The workspace's numbers are all derived from the same campaign record the
 * public page renders, so a creator and a backer never see two versions of the
 * same ledger. The escrow summary keeps released stablecoin and settled fiat
 * apart (FR-405): saying "you have been paid" when the money is still USDC in a
 * wallet would be wrong.
 */

/** What the creator has to do next, in plain language. */
export function nextActionFor(campaign: Campaign): string {
  switch (campaign.phase) {
    case "changes-requested":
      return "Answer the review note and resubmit for curation.";
    case "completed":
      return "Publish a closing update for your backers.";
    case "delivering":
      return "Submit the next milestone claim when the deliverable is complete.";
    case "draft":
      return "Finish the milestone plan, then submit for review.";
    case "funding":
      return "Funding is open. Answer backer questions and post updates.";
    case "funding-failed":
      return "The target was missed. Backers can claim refunds — publish an update explaining what happens next.";
    case "in-review":
      return "In review. Inverge will approve or ask for changes.";
    case "paused":
      return "Paused by Inverge. Respond to the review query.";
    case "rejected":
      return "Read the decision, then revise and submit a new campaign.";
    case "unknown":
      return "Status unavailable. Check the campaign again later.";
  }
}

function reviewNoteFor(campaign: Campaign): string | null {
  switch (campaign.review.status) {
    case "changes-requested":
      return campaign.review.summary;
    case "rejected":
      return campaign.review.reason;
    case "approved":
    case "in-review":
    case "not-submitted":
      return null;
  }
}

export function summariseCampaign(campaign: Campaign): CreatorCampaignSummary {
  const progress = milestoneProgress(campaign.milestones);

  return {
    backerCount: campaign.funding.backerCount,
    campaignId: campaign.id,
    category: campaign.category,
    closesAt: campaign.funding.closesAt,
    cover: campaign.cover,
    milestoneProgress: progress.total > 0 ? progress : null,
    nextAction: nextActionFor(campaign),
    phase: campaign.phase,
    publishedAt: campaign.publishedAt,
    raised: campaign.funding.raised,
    reviewNote: reviewNoteFor(campaign),
    slug: campaign.slug,
    target: campaign.funding.target,
    title: campaign.title,
    updatedAt: latestActivityAt(campaign),
  };
}

function latestActivityAt(campaign: Campaign): string {
  return campaign.updates.reduce(
    (most, update) => (update.createdAt > most ? update.createdAt : most),
    campaign.publishedAt ?? "",
  );
}

export type CreatorCampaignsView = {
  dataSource: DataSource;
  summaries: readonly CreatorCampaignSummary[];
  metrics: {
    /** Sum of indexed raised totals only, so an unindexed campaign adds nothing. */
    totalRaised: MoneyAmount;
    active: number;
    needsAttention: number;
    releasedTranches: number;
  };
};

export function getCreatorCampaignsView(): CreatorCampaignsView {
  const owned = previewCampaigns.filter((campaign) =>
    viewerCampaignIds.includes(campaign.id),
  );

  const summaries = owned
    .map(summariseCampaign)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const raised = owned
    .filter((campaign) => campaign.funding.source === "indexed")
    .map((campaign) => campaign.funding.raised)
    .filter((amount): amount is MoneyAmount => amount !== null);

  return {
    dataSource: campaignsDataSource,
    metrics: {
      active: owned.filter(
        (campaign) =>
          campaign.phase === "funding" || campaign.phase === "delivering",
      ).length,
      needsAttention: owned.filter(
        (campaign) =>
          campaign.phase === "changes-requested" ||
          campaign.phase === "paused" ||
          campaign.phase === "rejected",
      ).length,
      releasedTranches: owned.reduce((total, campaign) => {
        const progress = milestoneProgress(campaign.milestones);
        return total + progress.released;
      }, 0),
      totalRaised:
        raised.length === 0
          ? { atomic: "0", currency: "USD", decimals: 2 }
          : sumMoneyAmounts(raised),
    },
    summaries,
  };
}

export type CampaignWorkspaceView = {
  dataSource: DataSource;
  campaign: Campaign;
  summary: CreatorCampaignSummary;
  escrow: CreatorEscrowSummary;
  ledger: EscrowLedger;
  worklist: readonly MilestoneWorkload[];
};

export function getCampaignWorkspaceView(
  campaignId: string,
): CampaignWorkspaceView | null {
  // Resolved against the account's own campaigns, so a hand-edited URL can never
  // reach a campaign this creator does not own.
  const campaign = previewCampaigns.find(
    (item) => item.id === campaignId && viewerCampaignIds.includes(item.id),
  );
  if (!campaign) return null;

  const ledger = escrowLedger(campaign);
  const refunded = sumMoneyAmounts(
    contributionsForCampaign(campaign.id)
      .filter((item) => item.refund.state === "confirmed")
      .map((item) => item.refund.eligibleAmount)
      .filter((amount): amount is MoneyAmount => amount !== null),
  );

  return {
    campaign,
    dataSource: campaignsDataSource,
    escrow: {
      campaignId: campaign.id,
      payout: {
        destinationLabel: "Your connected wallet",
        lastSettledAt: null,
        // Off-ramp to naira is a partner integration (FR-405) and is not part of
        // this build, so a released tranche is deliberately not presented as
        // money in a bank account.
        state: "not-started",
      },
      raised: campaign.funding.raised,
      target: campaign.funding.target,
      totalPending: ledger.pending,
      totalRefunded: refunded,
      totalReleased: ledger.released,
    },
    ledger,
    summary: summariseCampaign(campaign),
    worklist: milestoneWorkload(campaign),
  };
}

/**
 * What the creator can do to each milestone right now.
 *
 * Only the next unreleased milestone of a funded campaign is submittable. A
 * claim that is already in review, approved, or released cannot be resubmitted —
 * and the reason is stated rather than the control simply being absent.
 */
export function milestoneWorkload(
  campaign: Campaign,
): readonly MilestoneWorkload[] {
  const current = currentMilestone(campaign.milestones);
  const funded = campaign.phase === "delivering";

  return campaign.milestones.map((milestone) => {
    const tranche = milestoneTranche(
      campaign.funding.target,
      milestone.allocationBps,
    );

    const isNext = funded && current?.id === milestone.id;
    const canSubmit = isNext && milestone.state === "upcoming";

    return {
      allocationBps: milestone.allocationBps,
      blockedReason: canSubmit
        ? null
        : blockingReason(campaign.phase, milestone, isNext),
      canSubmit,
      milestoneId: milestone.id,
      requiredAction: requiredAction(campaign.phase, milestone),
      sequence: milestone.sequence,
      state: milestone.state,
      title: milestone.title,
      tranche,
    };
  });
}

function requiredAction(
  phase: CampaignPhase,
  milestone: CampaignMilestone,
): string {
  if (phase !== "delivering") {
    switch (phase) {
      case "funding":
        return "Waiting for the funding window to close.";
      case "funding-failed":
        return "Not applicable. The target was missed and the escrow is refundable.";
      case "completed":
        return "Released.";
      case "unknown":
        return "Status unavailable.";
      default:
        return "Not started yet.";
    }
  }

  switch (milestone.state) {
    case "upcoming":
      return "Attach every piece of evidence this milestone defines, then submit the claim.";
    case "claim-submitted":
      return "Submitted. The objection window opens once the claim is accepted.";
    case "objection-window":
      return "Backers are reviewing the evidence. You will be notified when the window closes.";
    case "approved":
      return "Approved. The tranche is released once escrow settles.";
    case "released":
      return "Released.";
    case "failed":
      return "Claim failed. You can appeal within 72 hours.";
    case "disputed":
      return "A reviewer panel is ruling on your appeal.";
    case "refund-available":
      return "Not released. The remaining escrow is refundable to backers.";
    case "unknown":
      return "Status unavailable.";
  }
}

function blockingReason(
  phase: CampaignPhase,
  milestone: CampaignMilestone,
  isNext: boolean,
): string | null {
  if (phase === "completed") return "The campaign is complete.";
  if (phase === "funding")
    return "Funding has to succeed before any claim is made.";
  if (phase === "funding-failed") {
    return "The target was missed, so no claim can be made.";
  }
  if (phase !== "delivering") {
    return "This campaign cannot accept a milestone claim yet.";
  }

  switch (milestone.state) {
    case "claim-submitted":
      return "A claim is already in review.";
    case "objection-window":
      return "A claim is in its objection window.";
    case "approved":
      return "Approved and awaiting release.";
    case "released":
      return "Already released.";
    case "failed":
      return "This claim failed. Appeal it rather than resubmitting.";
    case "disputed":
      return "Your appeal is with the reviewer panel.";
    case "refund-available":
      return "Not released, and the escrow is refundable.";
    case "upcoming":
      return isNext ? null : "Complete the earlier milestones first.";
    case "unknown":
      return "Status unavailable.";
  }
}
