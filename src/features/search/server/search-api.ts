import "server-only";

import { z } from "zod";

import type {
  SearchHit,
  SearchHitKind,
  SearchPayload,
} from "@/features/search/types";
import { fetchApiJson } from "@/lib/api/server";

/**
 * Server-side content search.
 *
 * The palette never calls the API directly: the session token stays in the
 * HttpOnly cookie, and every result path is built here from fields the API
 * actually returned. Public and own reads are separate calls so a signed-out
 * visitor can never trigger `mine=true`, and a creator's drafts can never leak
 * into the public group.
 */

const creatorSchema = z
  .object({
    displayName: z.string().nullish(),
    username: z.string().nullish(),
  })
  .passthrough();

const ideaSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string(),
    problem: z.string().nullish(),
    solution: z.string().nullish(),
    status: z.string().nullish(),
    creator: creatorSchema.nullish(),
  })
  .passthrough();

const campaignSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().nullish(),
    summary: z.string().nullish(),
    status: z.string().nullish(),
    idea: ideaSchema.nullish(),
    creator: creatorSchema.nullish(),
  })
  .passthrough();

const ideaPageSchema = z.object({ data: z.array(ideaSchema) }).passthrough();

const campaignPageSchema = z
  .object({ data: z.array(campaignSchema) })
  .passthrough();

const STATUS_LABELS: Readonly<Record<string, string>> = {
  ACTIVE: "Funding open",
  ARCHIVED: "Archived",
  COMPLETED: "Completed",
  CONVERTED: "Converted",
  DRAFT: "Draft",
  FAILED: "Missed target",
  FUNDED: "Funded",
  IN_REVIEW: "In review",
  THRESHOLD_MET: "Threshold met",
  VALIDATING: "Validating",
};

function labelFor(status: string | null | undefined): string | null {
  if (!status) return null;
  return (
    STATUS_LABELS[status] ??
    status
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function creatorNameFor(
  creator:
    | {
        displayName?: string | null | undefined;
        username?: string | null | undefined;
      }
    | null
    | undefined,
): string | null {
  const displayName = creator?.displayName?.trim();
  if (displayName) return displayName;
  const username = creator?.username?.trim();
  return username ? `@${username}` : null;
}

function subtitleFor(
  creator: string | null,
  statusLabel: string | null,
): string {
  return [creator, statusLabel].filter(Boolean).join(" · ");
}

export function toIdeaHit(
  idea: z.infer<typeof ideaSchema>,
  isOwn: boolean,
): SearchHit {
  const statusLabel = labelFor(idea.status);
  return {
    href: isOwn
      ? `/d/creator/ideas/${encodeURIComponent(idea.id)}`
      : `/ideas/${encodeURIComponent(idea.slug)}`,
    id: idea.id,
    isOwn,
    kind: "idea",
    status: idea.status?.trim() || null,
    statusLabel,
    subtitle: subtitleFor(creatorNameFor(idea.creator), statusLabel),
    title: idea.title.trim() || "Untitled idea",
  };
}

export function toCampaignHit(
  campaign: z.infer<typeof campaignSchema>,
  isOwn: boolean,
): SearchHit {
  const statusLabel = labelFor(campaign.status);
  const idea = campaign.idea;
  const slug = idea?.slug?.trim() || campaign.id;
  const title =
    idea?.title?.trim() || campaign.title?.trim() || "Untitled campaign";

  return {
    href: isOwn
      ? `/d/creator/campaigns/${encodeURIComponent(campaign.id)}`
      : `/campaigns/${encodeURIComponent(slug)}`,
    id: campaign.id,
    isOwn,
    kind: "campaign",
    status: campaign.status?.trim() || null,
    statusLabel,
    subtitle: subtitleFor(creatorNameFor(campaign.creator), statusLabel),
    title,
  };
}

/**
 * Own results win a duplicate id: a creator's draft belongs in "Your ideas" and
 * must not appear a second time in the public group.
 */
export function mergeHits(
  own: SearchHit[],
  publicHits: SearchHit[],
): SearchHit[] {
  const ownIds = new Set(own.map((hit) => hit.id));
  return [...own, ...publicHits.filter((hit) => !ownIds.has(hit.id))];
}

function listPath(
  kind: SearchHitKind,
  options: { mine: boolean; query: string; limit: number },
): string {
  const params = new URLSearchParams({
    limit: String(options.limit),
    q: options.query,
  });
  if (options.mine) params.set("mine", "true");
  return `/${kind === "idea" ? "ideas" : "campaigns"}?${params.toString()}`;
}

async function fetchIdeas(
  query: string,
  limit: number,
  options: { mine: boolean; token?: string | null | undefined },
): Promise<SearchHit[]> {
  const payload = await fetchApiJson<unknown>(
    listPath("idea", { limit, mine: options.mine, query }),
    { token: options.token ?? null },
  );
  return ideaPageSchema
    .parse(payload)
    .data.map((idea) => toIdeaHit(idea, options.mine));
}

async function fetchCampaigns(
  query: string,
  limit: number,
  options: { mine: boolean; token?: string | null | undefined },
): Promise<SearchHit[]> {
  const payload = await fetchApiJson<unknown>(
    listPath("campaign", { limit, mine: options.mine, query }),
    { token: options.token ?? null },
  );
  return campaignPageSchema
    .parse(payload)
    .data.map((campaign) => toCampaignHit(campaign, options.mine));
}

export type SearchContentOptions = {
  query: string;
  /** Only pass a token when the caller asked for own content. */
  token?: string | null | undefined;
  includeOwn?: boolean;
  /** Per-group cap. The palette shows a short, scannable list. */
  limit?: number;
};

/**
 * A failed own-content read is reported as `ownIncluded: false` rather than
 * failing the whole search: public results are still useful, and the UI must
 * not imply a private search succeeded when it did not.
 */
export async function searchContent({
  query,
  token = null,
  includeOwn = false,
  limit = 6,
}: SearchContentOptions): Promise<SearchPayload> {
  const boundedLimit = Math.min(Math.max(1, Math.trunc(limit)), 10);
  const canReadOwn = includeOwn && Boolean(token);

  const ownRead = canReadOwn
    ? Promise.all([
        fetchIdeas(query, boundedLimit, { mine: true, token }),
        fetchCampaigns(query, boundedLimit, { mine: true, token }),
      ])
        .then(([ideas, campaigns]) => ({ campaigns, ideas }))
        .catch(() => null)
    : Promise.resolve(null);

  const [publicIdeas, publicCampaigns, own] = await Promise.all([
    fetchIdeas(query, boundedLimit, { mine: false }),
    fetchCampaigns(query, boundedLimit, { mine: false }),
    ownRead,
  ]);

  const ownIdeas = own?.ideas ?? [];
  const ownCampaigns = own?.campaigns ?? [];

  return {
    campaigns: mergeHits(ownCampaigns, publicCampaigns),
    ideas: mergeHits(ownIdeas, publicIdeas),
    meta: {
      ownIncluded: own !== null,
      query,
    },
  };
}
