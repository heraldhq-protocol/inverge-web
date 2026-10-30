import "server-only";

import { cache } from "react";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import type { ApiCampaignDetail } from "@/features/campaigns/server/live-campaign-detail";
import {
  nextActionFor,
  phaseFor,
} from "@/features/campaigns/server/live-creator-campaigns";
import type { CampaignPhase } from "@/features/campaigns/types";
import { ApiRequestError, fetchApiJson, isApiConfigured } from "@/lib/api/server";
import { decimalToUsdAmount, type MoneyAmount } from "@/lib/money";

/**
 * One live campaign as its creator sees it.
 *
 * Unlike the public detail projection, this keeps drafts and review states.
 * Escrow balances and contribution rows are not part of the campaign response,
 * so the workspace does not show them rather than borrowing preview figures.
 */

type ApiCreatorCampaignDetail = ApiCampaignDetail & {
  title?: string;
  summary?: string;
  reviewStatus?: string;
};

export type LiveCreatorMilestone = {
  id: string;
  index: number;
  title: string;
  deliverable: string;
  tranchePct: number;
  state: "planned" | "submitted" | "objection" | "released" | "rejected";
  stateLabel: string;
  objectionWindowEndsAt: string | null;
};

export type LiveCreatorCampaignView = {
  campaignId: string;
  title: string;
  summary: string;
  phase: CampaignPhase;
  reviewStatus: string | null;
  nextAction: string;
  cover: string | null;
  slug: string;
  publicHref: string | null;
  target: MoneyAmount;
  raised: MoneyAmount;
  deadline: string;
  launchedAt: string | null;
  milestones: readonly LiveCreatorMilestone[];
};

export type LiveCreatorCampaignResult =
  | { status: "ready"; view: LiveCreatorCampaignView }
  | { status: "not_found" }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

const MILESTONE_LABELS = {
  objection: "Objection window open",
  planned: "Planned",
  rejected: "Claim rejected",
  released: "Released",
  submitted: "Claim under review",
} as const;

const PUBLIC_STATUSES = new Set(["ACTIVE", "COMPLETED", "FAILED", "FUNDED"]);

function milestoneState(
  milestone: ApiCampaignDetail["milestones"][number],
): LiveCreatorMilestone["state"] {
  const claim = milestone.latestClaim;
  if (!claim) return "planned";
  switch (claim.status) {
    case "APPROVED":
    case "RELEASED":
      return "released";
    case "REJECTED":
      return "rejected";
    case "OBJECTION_WINDOW":
    case "OBJECTION":
      return "objection";
    default:
      return "submitted";
  }
}

function toView(campaign: ApiCreatorCampaignDetail): LiveCreatorCampaignView {
  const phase = phaseFor(campaign.status, campaign.reviewStatus);
  const slug = campaign.idea?.slug?.trim() || campaign.id;
  const milestones = (campaign.milestones ?? [])
    .map((milestone) => {
      const state = milestoneState(milestone);
      return {
        deliverable: milestone.deliverable,
        id: milestone.id,
        index: milestone.index,
        objectionWindowEndsAt: milestone.latestClaim?.objectionWindowEndsAt ?? null,
        state,
        stateLabel: MILESTONE_LABELS[state],
        title: milestone.title,
        tranchePct: milestone.tranchePct,
      };
    })
    .sort((left, right) => left.index - right.index);

  return {
    campaignId: campaign.id,
    cover: campaign.coverImageUrl ?? campaign.videoPosterUrl,
    deadline: campaign.deadline,
    launchedAt: campaign.launchedAt ?? null,
    milestones,
    nextAction: nextActionFor(phase),
    phase,
    publicHref: PUBLIC_STATUSES.has(campaign.status)
      ? `/campaigns/${encodeURIComponent(slug)}`
      : null,
    raised: decimalToUsdAmount(campaign.totalRaised),
    reviewStatus: campaign.reviewStatus ?? null,
    slug,
    summary:
      campaign.summary?.trim() ||
      campaign.idea?.problem.trim() ||
      "No campaign summary is stored yet.",
    target: decimalToUsdAmount(campaign.targetAmount),
    title:
      campaign.title?.trim() ||
      campaign.idea?.title.trim() ||
      "Untitled campaign",
  };
}

export const getLiveCreatorCampaignView = cache(
  async (campaignId: string): Promise<LiveCreatorCampaignResult> => {
    if (isPreviewAuth() || !isApiConfigured()) {
      return { status: "not_found" };
    }

    const token = await readSessionToken();
    if (!token) return { status: "signed_out" };

    try {
      const campaign = await fetchApiJson<ApiCreatorCampaignDetail>(
        `/campaigns/${encodeURIComponent(campaignId)}`,
        { token },
      );
      return { status: "ready", view: toView(campaign) };
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 401) return { status: "signed_out" };
        if (error.status === 403 || error.status === 404) {
          return { status: "not_found" };
        }
        return { reason: error.message, status: "unavailable" };
      }
      return {
        reason: "The API could not be reached.",
        status: "unavailable",
      };
    }
  },
);
