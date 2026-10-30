import "server-only";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { getCreatorCampaignsView } from "@/features/campaigns/server/creator";
import type { ApiCampaign } from "@/features/campaigns/server/live-campaigns";
import {
  isCampaignCategorySlug,
  isCampaignSubcategoryOf,
  type CampaignCategorySlug,
  type CampaignSubcategorySlug,
} from "@/features/campaigns/lib/taxonomy";
import type {
  CampaignPhase,
  CampaignTaxonomy,
  CreatorCampaignSummary,
} from "@/features/campaigns/types";
import { ApiRequestError, fetchApiJson, isApiConfigured } from "@/lib/api/server";
import { decimalToUsdAmount, sumMoneyAmounts } from "@/lib/money";

/**
 * A creator's live campaign list.
 *
 * The public mapper deliberately drops non-public statuses; the creator view is
 * the opposite: drafts, review states and rejected campaigns are the point. This
 * projection keeps the lifecycle and curation axes separate and maps only fields
 * the list endpoint returns. The workspace, edit and milestone screens are still
 * preview routes, so live rows link to the public page only.
 */

type ApiCreatorCampaign = ApiCampaign & {
  title?: string;
  summary?: string;
  reviewStatus?: string;
  launchedAt?: string | null;
  updatedAt?: string;
};

type ApiCreatorCampaignPage = {
  data: ApiCreatorCampaign[];
  page: { hasMore: boolean; nextCursor: string | null };
};

export type CreatorCampaignsPageView = {
  dataSource: "live" | "preview";
  summaries: readonly CreatorCampaignSummary[];
  metrics: ReturnType<typeof getCreatorCampaignsView>["metrics"];
};

export type CreatorCampaignsResult =
  | { status: "ready"; view: CreatorCampaignsPageView }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

const PHASE_BY_STATUS: Readonly<Record<string, CampaignPhase>> = {
  ACTIVE: "funding",
  COMPLETED: "completed",
  DRAFT: "draft",
  FAILED: "funding-failed",
  FUNDED: "delivering",
  IN_REVIEW: "in-review",
};

export function phaseFor(status: string, reviewStatus: string | undefined): CampaignPhase {
  if (status === "DRAFT") {
    if (reviewStatus === "CHANGES_REQUESTED") return "changes-requested";
    if (reviewStatus === "REJECTED") return "rejected";
    if (reviewStatus === "IN_REVIEW") return "in-review";
  }
  return PHASE_BY_STATUS[status] ?? "unknown";
}

export function nextActionFor(phase: CampaignPhase): string {
  switch (phase) {
    case "changes-requested":
      return "Answer the review note and resubmit for curation.";
    case "completed":
      return "Publish a closing update for your backers.";
    case "delivering":
      return "Submit the next milestone claim when the deliverable is complete.";
    case "draft":
      return "Finish the campaign plan, then submit for review.";
    case "funding":
      return "Funding is open. Answer backer questions and post updates.";
    case "funding-failed":
      return "The target was missed. Backers can claim refunds.";
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

function taxonomyFor(campaign: ApiCreatorCampaign): CampaignTaxonomy | null {
  const candidate =
    campaign.taxonomy?.category !== null && campaign.taxonomy?.category !== undefined
      ? campaign.taxonomy
      : campaign.idea
        ? {
            category: campaign.idea.taxonomyCategorySlug,
            subcategory: campaign.idea.taxonomySubcategorySlug,
          }
        : null;

  if (!candidate?.category || !isCampaignCategorySlug(candidate.category)) {
    return null;
  }

  const category = candidate.category as CampaignCategorySlug;
  const subcategory =
    candidate.subcategory &&
    isCampaignSubcategoryOf(category, candidate.subcategory)
      ? (candidate.subcategory as CampaignSubcategorySlug)
      : null;

  return { category, subcategory };
}

function toSummary(campaign: ApiCreatorCampaign): CreatorCampaignSummary {
  const phase = phaseFor(campaign.status, campaign.reviewStatus);
  const taxonomy = taxonomyFor(campaign);
  const isPublic =
    phase === "funding" ||
    phase === "delivering" ||
    phase === "completed" ||
    phase === "funding-failed";

  return {
    backerCount: null,
    campaignId: campaign.id,
    category: "creative",
    taxonomy,
    closesAt: campaign.deadline,
    cover: campaign.coverImageUrl ?? campaign.videoPosterUrl,
    milestoneProgress:
      campaign.milestoneSummary.total > 0 ? campaign.milestoneSummary : null,
    nextAction: nextActionFor(phase),
    phase,
    publishedAt: isPublic
      ? (campaign.launchedAt ?? campaign.createdAt)
      : null,
    raised: decimalToUsdAmount(campaign.totalRaised),
    reviewNote: null,
    slug: campaign.idea?.slug?.trim() || campaign.id,
    target: decimalToUsdAmount(campaign.targetAmount),
    title:
      campaign.title?.trim() ||
      campaign.idea?.title.trim() ||
      "Untitled campaign",
    updatedAt: campaign.updatedAt ?? campaign.createdAt,
  };
}

export async function getCreatorCampaignsPageView(): Promise<CreatorCampaignsResult> {
  if (isPreviewAuth() || !isApiConfigured()) {
    const preview = getCreatorCampaignsView();
    return {
      status: "ready",
      view: {
        dataSource: "preview",
        metrics: preview.metrics,
        summaries: preview.summaries,
      },
    };
  }

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  try {
    const page = await fetchApiJson<ApiCreatorCampaignPage>(
      "/campaigns?mine=true&limit=50",
      { token },
    );
    const summaries = page.data
      .map(toSummary)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    const raised = summaries
      .map((summary) => summary.raised)
      .filter((amount) => amount !== null);

    return {
      status: "ready",
      view: {
        dataSource: "live",
        metrics: {
          active: summaries.filter(
            (summary) =>
              summary.phase === "funding" || summary.phase === "delivering",
          ).length,
          needsAttention: summaries.filter(
            (summary) =>
              summary.phase === "changes-requested" ||
              summary.phase === "paused" ||
              summary.phase === "rejected",
          ).length,
          releasedTranches: summaries.reduce(
            (total, summary) =>
              total + (summary.milestoneProgress?.released ?? 0),
            0,
          ),
          totalRaised:
            raised.length === 0
              ? { atomic: "0", currency: "USD", decimals: 2 }
              : sumMoneyAmounts(
                  raised.filter((amount): amount is NonNullable<typeof amount> =>
                    amount !== null,
                  ),
                ),
        },
        summaries,
      },
    };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: "signed_out" };
    }
    return {
      reason:
        error instanceof ApiRequestError
          ? error.message
          : "The API could not be reached.",
      status: "unavailable",
    };
  }
}
