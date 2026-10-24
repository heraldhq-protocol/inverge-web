import type { IdeaArtworkVariant } from "@/features/home/types";
import {
  campaignCategoryLabel,
  campaignSubcategoryLabel,
  isCampaignCategorySlug,
  isCampaignSubcategoryOf,
  type CampaignCategorySlug,
  type CampaignSubcategorySlug,
} from "@/features/campaigns/lib/taxonomy";
import { fetchApiJson } from "@/lib/api/server";
import { creatorNameFor, type ApiPublicCreator } from "@/lib/api/public-name";
import { decimalToUsdAmount, type MoneyAmount } from "@/lib/money";

/**
 * Live campaign reads from `GET /api/v1/campaigns`.
 *
 * The campaign API is narrower than the preview `Campaign` model: it has no
 * slug, story, media, rewards, or published escrow terms. This module maps only
 * the fields that exist, so a live card never borrows a fixture field or shows
 * a zero for something the API did not send.
 */

type ApiIdeaSummary = {
  id: string;
  slug: string;
  title: string;
  problem: string;
  solution: string;
  category: string;
  taxonomyCategorySlug: string | null;
  taxonomySubcategorySlug: string | null;
  region: string | null;
  coverImageUrl: string | null;
};

export type ApiCampaign = {
  id: string;
  ideaId: string | null;
  ideaSnapshot: unknown;
  status: string;
  targetAmount: string | number;
  totalRaised: string | number;
  deadline: string;
  coverImageUrl: string | null;
  videoPosterUrl: string | null;
  createdAt: string;
  taxonomy: { category: string | null; subcategory: string | null } | null;
  creator: ApiPublicCreator | null;
  idea: ApiIdeaSummary | null;
  milestoneSummary: { total: number; released: number };
};

type ApiListPage<Row> = {
  data: Row[];
  page: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type LiveCampaignStatus = "active" | "funded" | "failed" | "completed";

export type LiveCampaign = {
  id: string;
  title: string;
  summary: string;
  creator: string;
  location: string;
  cover: string | null;
  artwork: IdeaArtworkVariant;
  taxonomyCategory: CampaignCategorySlug | null;
  taxonomySubcategory: CampaignSubcategorySlug | null;
  taxonomyText: string;
  status: LiveCampaignStatus;
  statusLabel: string;
  target: MoneyAmount;
  raised: MoneyAmount;
  /** Whole percent, uncapped so an overfunded campaign can say 150%. */
  percentFunded: number;
  deadline: string | null;
  milestones: { total: number; released: number };
  /** The source idea a card can open. Null when the record has no idea. */
  ideaId: string | null;
  ideaTitle: string | null;
};

const PAGE_LIMIT = 50;
const MAX_CAMPAIGNS = 300;

const PUBLIC_STATUSES: Readonly<Record<string, LiveCampaignStatus>> = {
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
  FUNDED: "funded",
};

const STATUS_LABELS: Readonly<Record<LiveCampaignStatus, string>> = {
  active: "Funding open",
  completed: "Completed",
  failed: "Missed target",
  funded: "Funded",
};

const ARTWORK_BY_CATEGORY: Readonly<
  Record<CampaignCategorySlug, IdeaArtworkVariant>
> = {
  art: "creative",
  comics: "creative",
  crafts: "creative",
  dance: "creative",
  design: "creative",
  fashion: "creative",
  film: "creative",
  food: "food",
  games: "creative",
  journalism: "creative",
  music: "creative",
  photography: "creative",
  publishing: "creative",
  technology: "campus",
  theater: "creative",
};

function publicStatus(status: string): LiveCampaignStatus | null {
  return PUBLIC_STATUSES[status] ?? null;
}

export function isReadableCampaign(campaign: ApiCampaign): boolean {
  return publicStatus(campaign.status) !== null;
}

function snapshotText(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
}

function taxonomyFor(
  campaign: ApiCampaign,
): {
  category: CampaignCategorySlug | null;
  subcategory: CampaignSubcategorySlug | null;
} {
  // Campaigns copy the source idea's pair at conversion. Falling back to the
  // idea keeps older campaign rows discoverable after the taxonomy columns were
  // added; a pair that is not in the canonical list stays unassigned.
  const candidate =
    campaign.taxonomy?.category !== null &&
    campaign.taxonomy?.category !== undefined
      ? campaign.taxonomy
      : campaign.idea
        ? {
            category: campaign.idea.taxonomyCategorySlug,
            subcategory: campaign.idea.taxonomySubcategorySlug,
          }
        : null;

  if (!candidate?.category || !isCampaignCategorySlug(candidate.category)) {
    return { category: null, subcategory: null };
  }

  const category = candidate.category;
  const subcategory =
    candidate.subcategory &&
    isCampaignSubcategoryOf(category, candidate.subcategory)
      ? (candidate.subcategory as CampaignSubcategorySlug)
      : null;

  return { category, subcategory };
}

function deadlineFor(value: string): string | null {
  return Number.isFinite(Date.parse(value)) ? value : null;
}

/**
 * Whole percent funded, in integer maths.
 *
 * A target of zero has no meaningful percentage, so it reports 0 rather than
 * dividing. The result is not capped: an overfunded campaign's percentage is
 * real information, and the meter caps its own fill.
 */
export function percentFundedFor(
  raised: string | number,
  target: string | number,
): number {
  const raisedAtomic = BigInt(decimalToUsdAmount(raised).atomic);
  const targetAtomic = BigInt(decimalToUsdAmount(target).atomic);
  if (targetAtomic <= 0n) return 0;
  return Math.max(0, Number((raisedAtomic * 100n) / targetAtomic));
}

function taxonomyTextFor(
  category: CampaignCategorySlug | null,
  subcategory: CampaignSubcategorySlug | null,
): string {
  if (!category) return "Uncategorised";
  const parent = campaignCategoryLabel(category);
  return subcategory
    ? `${parent} / ${campaignSubcategoryLabel(category, subcategory)}`
    : parent;
}

export function toLiveCampaign(campaign: ApiCampaign): LiveCampaign | null {
  const status = publicStatus(campaign.status);
  if (!status) return null;

  const { category, subcategory } = taxonomyFor(campaign);
  const creator = creatorNameFor(campaign.creator);
  const title =
    campaign.idea?.title.trim() ||
    snapshotText(campaign.ideaSnapshot, "title") ||
    "Untitled campaign";
  const summary =
    campaign.idea?.problem.trim() ||
    campaign.idea?.solution.trim() ||
    snapshotText(campaign.ideaSnapshot, "summary") ||
    snapshotText(campaign.ideaSnapshot, "problem") ||
    "No public summary is available for this campaign.";
  const milestones = {
    released: Math.max(0, campaign.milestoneSummary?.released ?? 0),
    total: Math.max(0, campaign.milestoneSummary?.total ?? 0),
  };

  return {
    artwork: category ? ARTWORK_BY_CATEGORY[category] : "creative",
    cover:
      campaign.coverImageUrl ??
      campaign.videoPosterUrl ??
      campaign.idea?.coverImageUrl ??
      null,
    creator,
    deadline: deadlineFor(campaign.deadline),
    id: campaign.id,
    ideaId: campaign.idea?.id ?? campaign.ideaId,
    ideaTitle: campaign.idea?.title.trim() || null,
    location: campaign.idea?.region?.trim() || "Location not shared",
    milestones,
    percentFunded: percentFundedFor(campaign.totalRaised, campaign.targetAmount),
    raised: decimalToUsdAmount(campaign.totalRaised),
    status,
    statusLabel: STATUS_LABELS[status],
    summary,
    target: decimalToUsdAmount(campaign.targetAmount),
    taxonomyCategory: category,
    taxonomySubcategory: subcategory,
    taxonomyText: taxonomyTextFor(category, subcategory),
    title,
  };
}

async function fetchCampaignPage(options: {
  category: CampaignCategorySlug;
  cursor?: string | null;
  limit?: number;
}): Promise<ApiListPage<ApiCampaign>> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? PAGE_LIMIT),
    taxonomyCategory: options.category,
  });
  if (options.cursor) params.set("cursor", options.cursor);

  return fetchApiJson<ApiListPage<ApiCampaign>>(
    `/campaigns?${params.toString()}`,
  );
}

/**
 * A bounded live window for one taxonomy parent.
 *
 * The category header and its subcategory counts must describe the same set as
 * the grid, so one window is loaded per category and the child filter runs over
 * it. Past `MAX_CAMPAIGNS` the page states that the counts cover the window
 * rather than claiming a catalogue total the API did not return.
 */
export async function getLiveCampaignWindow(options: {
  category: CampaignCategorySlug;
  max?: number;
}): Promise<{ campaigns: ApiCampaign[]; truncated: boolean }> {
  const max = Math.max(PAGE_LIMIT, options.max ?? MAX_CAMPAIGNS);
  const campaigns: ApiCampaign[] = [];
  let cursor: string | null = null;

  while (campaigns.length < max) {
    const page = await fetchCampaignPage({
      category: options.category,
      cursor,
      limit: Math.min(PAGE_LIMIT, max - campaigns.length),
    });
    campaigns.push(...page.data);
    cursor = page.page.nextCursor;
    if (!cursor || page.data.length === 0) {
      return { campaigns, truncated: false };
    }
  }

  return { campaigns, truncated: cursor !== null };
}

export { MAX_CAMPAIGNS, PAGE_LIMIT };
