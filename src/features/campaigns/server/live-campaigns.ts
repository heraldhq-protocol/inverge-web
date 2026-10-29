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
  // Detail reads include the rest of the pitch; the list projection does not.
  targetUser?: string | null;
  currentAlternative?: string | null;
  roadmap?: string | null;
  roadmapSteps?: unknown;
  risks?: string | null;
  askAmount?: string | number | null;
  askBreakdown?: unknown;
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
  /** The public campaign URL segment: the source idea's slug, else the id. */
  slug: string;
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

/** The canonical public path for a live campaign. */
export function campaignHref(campaign: Pick<LiveCampaign, "id" | "slug">) {
  return `/campaigns/${encodeURIComponent(campaign.slug)}`;
}

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

function taxonomyFor(campaign: ApiCampaign): {
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
    percentFunded: percentFundedFor(
      campaign.totalRaised,
      campaign.targetAmount,
    ),
    raised: decimalToUsdAmount(campaign.totalRaised),
    slug: campaign.idea?.slug?.trim() || campaign.id,
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

/**
 * Campaign discovery parameters the live API can actually honour.
 *
 * Search, money bands, country and percent filters belong to the preview
 * discovery grid and have no server-side equivalent yet. Rather than render
 * controls that silently do nothing, the live feed offers only these.
 */
export type LiveCampaignFeedStatus =
  "all" | "active" | "completed" | "failed" | "funded";

export type LiveCampaignFeedSort = "closing-soon" | "most-backed" | "newest";

export type LiveCampaignFeedParams = {
  cursor: string | null;
  sort: LiveCampaignFeedSort;
  status: LiveCampaignFeedStatus;
};

const FEED_STATUSES: readonly LiveCampaignFeedStatus[] = [
  "all",
  "active",
  "completed",
  "failed",
  "funded",
];

const FEED_SORTS: readonly LiveCampaignFeedSort[] = [
  "closing-soon",
  "most-backed",
  "newest",
];

const STATUS_TO_API: Readonly<
  Record<Exclude<LiveCampaignFeedStatus, "all">, string>
> = {
  active: "ACTIVE",
  completed: "COMPLETED",
  failed: "FAILED",
  funded: "FUNDED",
};

function firstValue(value: string | string[] | undefined): string {
  if (!Array.isArray(value)) return value ?? "";
  // A cleared control can append an empty value before the real one, so the
  // first non-empty entry is the one the reader meant.
  return value.find((entry) => entry.trim() !== "") ?? "";
}

/**
 * Parse the feed query string against allowlists.
 *
 * An unknown status or sort falls back to the default rather than being sent to
 * the API, and a cursor is passed through as the opaque value it is. Nothing
 * here is used to build SQL.
 */
export function parseCampaignFeedParams(
  params: Record<string, string | string[] | undefined>,
): LiveCampaignFeedParams {
  const requestedStatus = firstValue(params.status);
  const requestedSort = firstValue(params.sort);
  const cursor = firstValue(params.cursor).trim();

  return {
    cursor: cursor === "" ? null : cursor.slice(0, 512),
    sort: FEED_SORTS.includes(requestedSort as LiveCampaignFeedSort)
      ? (requestedSort as LiveCampaignFeedSort)
      : "newest",
    status: FEED_STATUSES.includes(requestedStatus as LiveCampaignFeedStatus)
      ? (requestedStatus as LiveCampaignFeedStatus)
      : "all",
  };
}

export type LiveCampaignPage = {
  campaigns: LiveCampaign[];
  hasMore: boolean;
  nextCursor: string | null;
};

/**
 * One page of the public campaign catalogue.
 *
 * This is a single API page rather than a fetched window: the index shows what
 * `GET /campaigns` returned, follows its cursor for "load more", and never
 * implies it is holding the whole catalogue.
 */
export async function getLiveCampaignPage(options: {
  cursor?: string | null;
  limit?: number;
  sort?: LiveCampaignFeedSort;
  status?: LiveCampaignFeedStatus;
}): Promise<LiveCampaignPage> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? PAGE_LIMIT),
    sort: options.sort ?? "newest",
  });
  if (options.status && options.status !== "all") {
    params.set("status", STATUS_TO_API[options.status]);
  }
  if (options.cursor) params.set("cursor", options.cursor);

  const page = await fetchApiJson<ApiListPage<ApiCampaign>>(
    `/campaigns?${params.toString()}`,
  );

  return {
    campaigns: page.data
      .map(toLiveCampaign)
      .filter((campaign): campaign is LiveCampaign => campaign !== null),
    hasMore: page.page.hasMore,
    nextCursor: page.page.nextCursor,
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
