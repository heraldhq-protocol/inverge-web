import { ApiRequestError, fetchApiJson } from "@/lib/api/server";
import { decimalToUsdAmount, type MoneyAmount } from "@/lib/money";
import {
  parseImageSource,
  parseVideoSource,
} from "@/features/campaigns/lib/media";
import type { CampaignMedia } from "@/features/campaigns/types";
import {
  getLiveCampaignWindow,
  toLiveCampaign,
  type ApiCampaign,
  type LiveCampaign,
  type LiveCampaignStatus,
} from "@/features/campaigns/server/live-campaigns";

/**
 * A live campaign detail read from `GET /api/v1/campaigns/:idOrSlug`.
 *
 * The campaign row is smaller than the preview `Campaign` model, so this module
 * maps only what the API actually returns and marks every absent section
 * explicitly. Story copy comes from the campaign's source idea, milestones from
 * the published plan, and rewards from the stored `rewardTiers` JSON when it
 * matches the documented shape. Nothing is filled in from fixtures.
 */

type ApiCampaignMilestone = {
  id: string;
  index: number;
  title: string;
  deliverable: string;
  tranchePct: number;
  evidenceDefinition: unknown;
  latestClaim: {
    id: string;
    submittedAt: string;
    objectionWindowEndsAt: string | null;
    status: string;
  } | null;
};

export type ApiCampaignDetail = ApiCampaign & {
  ideaSnapshot: unknown;
  story: unknown;
  videoUrl: string | null;
  videoPosterUrl: string | null;
  rewardTiers: unknown;
  launchedAt: string | null;
  milestones: ApiCampaignMilestone[];
  creator:
    | (ApiCampaign["creator"] & {
        avatarUrl?: string | null;
        bio?: string | null;
      })
    | null;
  idea:
    | (NonNullable<ApiCampaign["idea"]> & {
        targetUser?: string | null;
        currentAlternative?: string | null;
        roadmap?: string | null;
        roadmapSteps?: unknown;
        risks?: string | null;
        askAmount?: string | number | null;
        askBreakdown?: unknown;
      })
    | null;
};

export type LiveMilestoneState =
  "planned" | "submitted" | "objection" | "released" | "rejected";

export type LiveCampaignMilestone = {
  id: string;
  index: number;
  title: string;
  deliverable: string;
  tranchePct: number;
  evidenceDefinition: string;
  state: LiveMilestoneState;
  stateLabel: string;
  objectionWindowEndsAt: string | null;
};

export type LiveRoadmapStep = { date: string; description: string };

export type LiveRewardTier = {
  id: string;
  title: string;
  description: string;
  minimum: MoneyAmount | null;
  estimatedDelivery: string | null;
  limitedQuantity: number | null;
};

export type LiveCampaignStory = {
  problem: string | null;
  solution: string | null;
  targetUser: string | null;
  currentAlternative: string | null;
  roadmap: string | null;
  risks: string | null;
};

export type LiveCampaignDetail = LiveCampaign & {
  ideaSlug: string | null;
  creatorAvatar: string | null;
  creatorBio: string | null;
  videoUrl: string | null;
  videoPosterUrl: string | null;
  /**
   * The creator's hero gallery, in their order. The first video is the hero
   * player; the first image is the hero still. Parsed from the stored `story`
   * JSON through the same allowlist the editor used, so an unusable entry is
   * dropped rather than rendered.
   */
  heroMedia: readonly CampaignMedia[];
  /** Media placed inside the story. Empty hides the block. */
  storyMedia: readonly CampaignMedia[];
  launchedAt: string | null;
  story: LiveCampaignStory;
  roadmapSteps: readonly LiveRoadmapStep[];
  milestonePlan: readonly LiveCampaignMilestone[];
  rewards: readonly LiveRewardTier[];
  /** `unsupported` means reward JSON exists but is not in a readable shape. */
  rewardDataState: "none" | "available" | "unsupported";
};

const PUBLIC_STATUSES: readonly LiveCampaignStatus[] = [
  "active",
  "funded",
  "failed",
  "completed",
];

const MILESTONE_LABELS: Readonly<Record<LiveMilestoneState, string>> = {
  objection: "Objection window open",
  planned: "Planned",
  rejected: "Claim rejected",
  released: "Released",
  submitted: "Claim under review",
};

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function positiveNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function milestoneState(milestone: ApiCampaignMilestone): {
  state: LiveMilestoneState;
  objectionWindowEndsAt: string | null;
} {
  const claim = milestone.latestClaim;
  if (!claim) return { objectionWindowEndsAt: null, state: "planned" };

  const objectionWindowEndsAt =
    claim.objectionWindowEndsAt &&
    Number.isFinite(Date.parse(claim.objectionWindowEndsAt))
      ? claim.objectionWindowEndsAt
      : null;

  switch (claim.status) {
    case "APPROVED":
    case "RELEASED":
      return { objectionWindowEndsAt, state: "released" };
    case "REJECTED":
      return { objectionWindowEndsAt, state: "rejected" };
    case "OBJECTION_WINDOW":
    case "OBJECTION":
      return { objectionWindowEndsAt, state: "objection" };
    default:
      return { objectionWindowEndsAt, state: "submitted" };
  }
}

export function parseRoadmapSteps(value: unknown): LiveRoadmapStep[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    const object = asObject(entry);
    const description = asText(object?.description);
    if (!description) return [];
    return [{ date: asText(object?.date) ?? "", description }];
  });
}

/**
 * Reward tiers are stored as creator-supplied JSON.
 *
 * Only a row with a title and a readable non-negative minimum is treated as a
 * tier, so a malformed entry is skipped rather than rendered as a zero-dollar
 * reward. If JSON exists but nothing parses, the caller shows an explicit
 * "rewards are not readable" state instead of claiming there are none.
 */
export function parseRewardTiers(value: unknown): LiveRewardTier[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    const object = asObject(entry);
    const title = asText(object?.title);
    const amount = object?.amount ?? object?.minimum;
    const minimumValue =
      typeof amount === "string" || typeof amount === "number"
        ? positiveNumber(amount)
        : null;
    if (!title || minimumValue === null) return [];

    return [
      {
        description: asText(object?.description) ?? "",
        estimatedDelivery: asText(object?.estimatedDelivery),
        id: asText(object?.id) ?? `${title}-${index}`,
        limitedQuantity:
          typeof object?.limitedQuantity === "number" &&
          Number.isInteger(object.limitedQuantity) &&
          object.limitedQuantity >= 0
            ? object.limitedQuantity
            : null,
        minimum: decimalToUsdAmount(minimumValue),
        title,
      },
    ];
  });
}

/**
 * Campaign media stored inside the `story` JSON, parsed into renderable items.
 *
 * The stored shape is the wizard's, which a creator can only produce through a
 * control that already validated it; this re-checks anyway, because a campaign
 * row can be older than the current rules or written by an older client. An
 * entry that does not parse is dropped: a broken image must not take the page
 * down, and an unvalidated URL must never reach an `<img>` or an `<iframe>`.
 */
export function parseLiveMedia(value: unknown): CampaignMedia[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index): CampaignMedia[] => {
    const object = asObject(entry);
    if (!object) return [];

    const alt = asText(object.alt);
    const src = asText(object.src);
    if (!alt || !src) return [];

    const id = asText(object.id) ?? `media-${index}`;
    const caption = asText(object.caption);

    if (object.kind === "video") {
      const parsed = parseVideoSource(src);
      if (!parsed.ok) return [];
      const poster = parseImageSource(asText(object.poster) ?? "");
      return [
        {
          alt,
          caption,
          id,
          kind: "video",
          poster: poster.ok ? poster.src : null,
          source: parsed.source,
        },
      ];
    }

    if (object.kind !== "image") return [];
    const parsed = parseImageSource(src);
    if (!parsed.ok) return [];

    return [{ alt, caption, id, kind: "image", src: parsed.src }];
  });
}

export function toLiveCampaignDetail(
  campaign: ApiCampaignDetail,
): LiveCampaignDetail | null {
  const base = toLiveCampaign(campaign);
  if (!base || !PUBLIC_STATUSES.includes(base.status)) return null;

  const milestones = Array.isArray(campaign.milestones)
    ? campaign.milestones
        .map((milestone) => {
          const { state, objectionWindowEndsAt } = milestoneState(milestone);
          return {
            deliverable: milestone.deliverable,
            // Evidence definitions are stored JSON. Only a plain string is
            // rendered; an object shape the API has not documented is omitted
            // rather than stringified into the public page.
            evidenceDefinition: asText(milestone.evidenceDefinition) ?? "",
            id: milestone.id,
            index: milestone.index,
            objectionWindowEndsAt,
            state,
            stateLabel: MILESTONE_LABELS[state],
            title: milestone.title,
            tranchePct: milestone.tranchePct,
          };
        })
        .sort((left, right) => left.index - right.index)
    : [];

  const rewards = parseRewardTiers(campaign.rewardTiers);
  const rewardDataState =
    campaign.rewardTiers == null ||
    (Array.isArray(campaign.rewardTiers) && campaign.rewardTiers.length === 0)
      ? "none"
      : rewards.length > 0
        ? "available"
        : "unsupported";

  const idea = campaign.idea;
  const storedStory = asObject(campaign.story);
  const releasedCount = milestones.filter(
    (milestone) => milestone.state === "released",
  ).length;

  return {
    ...base,
    creatorAvatar: asText(campaign.creator?.avatarUrl),
    creatorBio: asText(campaign.creator?.bio),
    heroMedia: parseLiveMedia(storedStory?.heroMedia),
    ideaSlug: idea?.slug?.trim() || null,
    launchedAt:
      campaign.launchedAt && Number.isFinite(Date.parse(campaign.launchedAt))
        ? campaign.launchedAt
        : null,
    milestonePlan: milestones,
    // The detail projection returns the plan itself, not the card summary, so
    // the released count has to describe that same plan.
    milestones: { released: releasedCount, total: milestones.length },
    rewardDataState,
    rewards,
    roadmapSteps: parseRoadmapSteps(idea?.roadmapSteps),
    storyMedia: parseLiveMedia(storedStory?.media),
    story: {
      currentAlternative:
        asText(idea?.currentAlternative) ??
        asText(asObject(campaign.ideaSnapshot)?.currentAlternative),
      problem:
        asText(idea?.problem) ??
        asText(asObject(campaign.ideaSnapshot)?.problem),
      risks: asText(idea?.risks),
      roadmap: asText(idea?.roadmap),
      solution:
        asText(idea?.solution) ??
        asText(asObject(campaign.ideaSnapshot)?.solution),
      targetUser:
        asText(idea?.targetUser) ??
        asText(asObject(campaign.ideaSnapshot)?.targetUser),
    },
    videoPosterUrl: asText(campaign.videoPosterUrl),
    videoUrl: asText(campaign.videoUrl),
  };
}

function deadlineKey(campaign: LiveCampaign): number {
  if (!campaign.deadline) return Number.MAX_SAFE_INTEGER;
  const parsed = Date.parse(campaign.deadline);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

/**
 * Deterministic related ranking: shared subcategory, then shared category, then
 * open campaigns, then the nearest deadline. `featured` is deliberately absent:
 * the campaign API does not expose an editorial flag, and inventing one from
 * funding performance would make paid or popular campaigns look editorially
 * chosen.
 */
export function rankLiveCampaigns(
  source: LiveCampaign,
  candidates: readonly LiveCampaign[],
): LiveCampaign[] {
  return [...candidates]
    .filter((candidate) => candidate.id !== source.id)
    .sort((left, right) => {
      const sourceSub = source.taxonomySubcategory;
      const leftSub =
        sourceSub !== null && left.taxonomySubcategory === sourceSub ? 0 : 1;
      const rightSub =
        sourceSub !== null && right.taxonomySubcategory === sourceSub ? 0 : 1;
      if (leftSub !== rightSub) return leftSub - rightSub;

      const leftOpen = left.status === "active" ? 0 : 1;
      const rightOpen = right.status === "active" ? 0 : 1;
      if (leftOpen !== rightOpen) return leftOpen - rightOpen;

      const byDeadline = deadlineKey(left) - deadlineKey(right);
      if (byDeadline !== 0) return byDeadline;

      return left.title.localeCompare(right.title);
    });
}

export type LiveCampaignDetailView = {
  campaign: LiveCampaignDetail;
  related: readonly LiveCampaign[];
  relatedState: "live" | "unavailable";
};

export type LiveCampaignRecommendationsView = {
  source: LiveCampaignDetail;
  recommendations: readonly LiveCampaign[];
  /** `live` also covers "no other campaign exists"; `unavailable` is a failure. */
  state: "live" | "unavailable";
};

async function relatedFor(
  campaign: LiveCampaign,
): Promise<{ campaigns: LiveCampaign[]; state: "live" | "unavailable" }> {
  if (!campaign.taxonomyCategory) return { campaigns: [], state: "live" };

  try {
    const window = await getLiveCampaignWindow({
      category: campaign.taxonomyCategory,
    });
    const campaigns = window.campaigns
      .map(toLiveCampaign)
      .filter((candidate): candidate is LiveCampaign => candidate !== null);

    return { campaigns: rankLiveCampaigns(campaign, campaigns), state: "live" };
  } catch {
    return { campaigns: [], state: "unavailable" };
  }
}

async function fetchCampaign(
  idOrSlug: string,
): Promise<LiveCampaignDetail | null> {
  try {
    const payload = await fetchApiJson<ApiCampaignDetail>(
      `/campaigns/${encodeURIComponent(idOrSlug)}`,
    );
    return toLiveCampaignDetail(payload);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}

export async function getLiveCampaignDetail(
  idOrSlug: string,
): Promise<LiveCampaignDetailView | null> {
  const campaign = await fetchCampaign(idOrSlug);
  if (!campaign) return null;

  const related = await relatedFor(campaign);
  return {
    campaign,
    related: related.campaigns.slice(0, 3),
    relatedState: related.state,
  };
}

export async function getLiveCampaignRecommendations(
  idOrSlug: string,
): Promise<LiveCampaignRecommendationsView | null> {
  const source = await fetchCampaign(idOrSlug);
  if (!source) return null;

  const related = await relatedFor(source);
  return {
    recommendations: related.campaigns,
    source,
    state: related.state,
  };
}
