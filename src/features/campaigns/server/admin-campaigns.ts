import "server-only";

import { readSessionToken } from "@/features/auth/server/session";
import {
  findPreviewCampaignById,
  previewCampaigns,
} from "@/features/campaigns/content/preview-campaigns";
import type {
  Campaign,
  CampaignPhase,
  CampaignReview,
  CampaignTaxonomy,
  MilestoneState,
} from "@/features/campaigns/types";
import {
  isCampaignCategorySlug,
  isCampaignSubcategoryOf,
  type CampaignSubcategorySlug,
} from "@/features/campaigns/lib/taxonomy";
import { decimalToUsdAmount } from "@/lib/money";
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
  sendApiJson,
  type ApiWriteResult,
} from "@/lib/api/server";

export type AdminReviewAction = "APPROVE" | "REQUEST_CHANGES" | "REJECT";

export type DecideCampaignReviewPayload = {
  action: AdminReviewAction;
  reason?: string | undefined;
};

/**
 * Normalises an API review status string into the frontend's discriminated union.
 */
function toCampaignReview(status?: string, date?: string, reason?: string): CampaignReview {
  const normalized = (status ?? "").toUpperCase();
  const timestamp = date ?? new Date().toISOString();

  switch (normalized) {
    case "APPROVED":
      return { status: "approved", approvedAt: timestamp };
    case "CHANGES_REQUESTED":
      return {
        status: "changes-requested",
        requestedAt: timestamp,
        summary: reason || "Please review the requested changes.",
      };
    case "REJECTED":
      return {
        status: "rejected",
        decidedAt: timestamp,
        reason: reason || "Campaign was not approved for publication.",
      };
    case "IN_REVIEW":
      return { status: "in-review", submittedAt: timestamp };
    default:
      return { status: "not-submitted" };
  }
}

function toCampaignPhase(status?: string): CampaignPhase {
  const normalized = (status ?? "").toUpperCase();
  switch (normalized) {
    case "DRAFT":
      return "draft";
    case "IN_REVIEW":
      return "in-review";
    case "CHANGES_REQUESTED":
      return "changes-requested";
    case "REJECTED":
      return "rejected";
    case "APPROVED":
    case "FUNDING":
      return "funding";
    case "DELIVERING":
      return "delivering";
    case "COMPLETED":
      return "completed";
    case "PAUSED":
      return "paused";
    default:
      return "in-review";
  }
}

type ApiAdminMilestone = {
  id?: string;
  title?: string;
  deliverable?: string;
  allocationBps?: number;
  tranchePct?: number;
  expectedAt?: string;
  evidenceDefinition?: string;
  status?: string;
};

type ApiAdminCampaign = {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  status?: string;
  reviewStatus?: string;
  reviewReason?: string;
  reviewNotes?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  targetAmount?: string;
  totalRaised?: string;
  backerCount?: number;
  deadline?: string;
  featured?: boolean;
  publishedAt?: string | null;
  location?: string;
  coverImageUrl?: string | null;
  taxonomy?: { category: string; subcategory: string } | null;
  idea?: {
    id?: string;
    slug?: string;
    title?: string;
    summary?: string;
    problem?: string;
    solution?: string;
    region?: string;
    coverImageUrl?: string | null;
    targetUser?: string;
    risks?: string;
  } | null;
  creator?: {
    id?: string;
    name?: string;
    username?: string;
    bio?: string;
    verified?: boolean;
  } | null;
  milestones?: ApiAdminMilestone[];
};

type ApiAdminCampaignListResponse = ApiAdminCampaign[] | { data: ApiAdminCampaign[] };
type ApiAdminCampaignDetailResponse = ApiAdminCampaign | { data: ApiAdminCampaign };

function toCampaignTaxonomy(raw: ApiAdminCampaign["taxonomy"]): CampaignTaxonomy | null {
  if (!raw || !raw.category) return null;
  if (!isCampaignCategorySlug(raw.category)) return null;
  const subcategory =
    raw.subcategory && isCampaignSubcategoryOf(raw.category, raw.subcategory)
      ? (raw.subcategory as CampaignSubcategorySlug)
      : null;
  return {
    category: raw.category,
    subcategory,
  };
}

function toMilestoneState(status?: string): MilestoneState {
  const norm = (status ?? "").toLowerCase();
  if (norm === "active" || norm === "claim-submitted" || norm === "objection-window" || norm === "approved" || norm === "released" || norm === "failed" || norm === "disputed" || norm === "refund-available") {
    return norm as MilestoneState;
  }
  return "upcoming";
}

/**
 * Maps an API campaign response row to the UI's Campaign presentation model.
 * Fills any presentation-only gaps safely without inventing balances.
 */
function toAdminCampaign(raw: ApiAdminCampaign): Campaign {
  const review = toCampaignReview(
    raw.reviewStatus ?? raw.status,
    raw.submittedAt ?? raw.updatedAt ?? raw.createdAt,
    raw.reviewReason ?? raw.reviewNotes,
  );
  const phase = toCampaignPhase(raw.status ?? raw.reviewStatus);
  const target = raw.targetAmount ? decimalToUsdAmount(raw.targetAmount) : decimalToUsdAmount(0);
  const raised = raw.totalRaised ? decimalToUsdAmount(raw.totalRaised) : decimalToUsdAmount(0);

  const title = raw.idea?.title ?? raw.title ?? "Untitled Campaign";
  const summary = raw.idea?.summary ?? raw.idea?.problem ?? raw.summary ?? "";

  return {
    id: raw.id,
    slug: raw.idea?.slug ?? raw.slug ?? raw.id,
    title,
    summary,
    category: "creative",
    taxonomy: toCampaignTaxonomy(raw.taxonomy),
    location: raw.idea?.region ?? raw.location ?? "Africa",
    cover: raw.coverImageUrl ?? raw.idea?.coverImageUrl ?? null,
    creator: {
      bio: raw.creator?.bio ?? "",
      identityVerified: Boolean(raw.creator?.verified),
      location: raw.idea?.region ?? raw.location ?? "Africa",
      name: raw.creator?.name ?? raw.creator?.username ?? "Creator",
      previousCampaigns: 0,
    },
    phase,
    review,
    funding: {
      source: "indexed",
      raised,
      backerCount: raw.backerCount ?? 0,
      target,
      fundingAsset: "USDC",
      supportedSettlementAssets: ["USDC"],
      closesAt: raw.deadline ?? new Date(Date.now() + 30 * 86_400_000).toISOString(),
    },
    milestones: Array.isArray(raw.milestones)
      ? raw.milestones.map((m, index) => ({
          id: m.id ?? `milestone-${index}`,
          sequence: index + 1,
          title: m.title ?? `Milestone ${index + 1}`,
          deliverable: m.deliverable ?? "",
          allocationBps: typeof m.allocationBps === "number" ? m.allocationBps : typeof m.tranchePct === "number" ? m.tranchePct * 100 : 0,
          expectedAt: m.expectedAt ?? null,
          evidence: typeof m.evidenceDefinition === "string" ? m.evidenceDefinition : "",
          state: toMilestoneState(m.status),
          submission: null,
          objectionClosesAt: null,
          objectionBps: 0,
          decision: null,
        }))
      : [],
    media: [],
    story: {
      problem: raw.idea?.problem ?? "",
      solution: raw.idea?.solution ?? summary,
      beneficiaries: raw.idea?.targetUser ?? "",
      useOfFunds: [],
      media: [],
      blocks: [],
    },
    supportTiers: [],
    faqs: [],
    disclosures: {
      eligibility: "Open to backers worldwide.",
      risks: raw.idea?.risks ?? "No specific risks disclosed.",
      failurePlan: "Funds returned to backers if funding target is not reached.",
    },
    updates: [],
    escrow: {
      workingCapitalBps: 2000,
      objectionWindowDays: 5,
      objectionThresholdBps: 2000,
      perWalletObjectionCapBps: 1000,
      successFeeBps: 500,
    },
    facts: [],
    featured: Boolean(raw.featured),
    publishedAt: raw.publishedAt ?? null,
    demo: true,
  };
}

/**
 * Server read for the admin campaign review queue.
 * Falls back to preview fixtures when API is unconfigured or in preview mode.
 */
export async function getAdminCampaigns(options: {
  reviewStatus?: string;
  skip?: number;
  take?: number;
} = {}): Promise<readonly Campaign[]> {
  if (!isApiConfigured()) {
    return previewCampaigns;
  }

  const token = await readSessionToken();
  if (!token) {
    return previewCampaigns;
  }

  try {
    const params = new URLSearchParams();
    if (options.reviewStatus) params.set("reviewStatus", options.reviewStatus);
    if (options.skip !== undefined) params.set("skip", String(options.skip));
    if (options.take !== undefined) params.set("take", String(options.take));

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetchApiJson<ApiAdminCampaignListResponse>(`/admin/campaigns${query}`, {
      token,
    });

    const rows = Array.isArray(response)
      ? response
      : response && "data" in response && Array.isArray(response.data)
        ? response.data
        : null;

    if (!rows) return previewCampaigns;
    return rows.map(toAdminCampaign);
  } catch (error) {
    console.warn("Failed to fetch live admin campaigns, falling back to fixtures:", error);
    return previewCampaigns;
  }
}

/**
 * Server read for one campaign's detailed review.
 * Falls back to preview fixture when API is unconfigured.
 */
export async function getAdminCampaignDetail(
  id: string,
): Promise<Campaign | null> {
  if (!isApiConfigured()) {
    return findPreviewCampaignById(id) ?? null;
  }

  const token = await readSessionToken();
  if (!token) {
    return findPreviewCampaignById(id) ?? null;
  }

  try {
    const response = await fetchApiJson<ApiAdminCampaignDetailResponse>(
      `/admin/campaigns/${encodeURIComponent(id)}`,
      { token },
    );

    if (!response) return null;
    const campaignData = "data" in response && response.data ? response.data : (response as ApiAdminCampaign);
    return toAdminCampaign(campaignData);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }
    console.warn(`Failed to fetch live admin campaign ${id}, falling back to fixture:`, error);
    return findPreviewCampaignById(id) ?? null;
  }
}

/**
 * Executes a curation decision against the live API via sendApiJson.
 */
export async function submitAdminCampaignReview(
  id: string,
  payload: DecideCampaignReviewPayload,
): Promise<ApiWriteResult> {
  const token = await readSessionToken();
  if (!token) {
    return {
      ok: false,
      status: 401,
      code: "NOT_SIGNED_IN",
      message: "An active admin session is required to record a decision.",
    };
  }

  return sendApiJson(`/admin/campaigns/${encodeURIComponent(id)}/review`, {
    method: "POST",
    token,
    body: payload,
  });
}
