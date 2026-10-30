import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { IdeaArtworkVariant } from "@/features/home/types";
import type {
  FeedbackForm,
  FeedbackQuestion,
  FeedbackQuestionType,
} from "@/features/feedback/types";
import type { IdeaSignals } from "@/features/ideas/lib/signals";
import {
  isIdeaCategorySlug,
  isIdeaSubcategoryOf,
  ideaCategoryLabel,
  type IdeaCategorySlug,
  type IdeaSubcategorySlug,
} from "@/features/ideas/lib/taxonomy";
import type {
  AskBreakdownItem,
  DiscoveryIdea,
  IdeaComment,
  IdeaDetail,
  IdeaRegion,
  IdeaStatus,
  MyIdea,
  RoadmapStep,
} from "@/features/ideas/types";
import { fetchApiJson } from "@/lib/api/server";
import {
  creatorNameFor,
  initialsFor,
  publicHandleFor,
  type ApiPublicCreator,
} from "@/lib/api/public-name";
import { decimalToUsdAmount, type MoneyAmount } from "@/lib/money";

/**
 * Live idea reads from `GET /api/v1/ideas`.
 *
 * The API is the source of record here. Nothing in this module invents a field
 * the API does not return: absent engagement, writer, or funding data stays
 * absent instead of becoming a zero or a fixture value.
 */

type ApiCreator = ApiPublicCreator & {
  bio: string | null;
  identityVerified: boolean;
};

type ApiGateCriterion = {
  have: number;
  need: number;
  pct: number;
  met: boolean;
};

type ApiGateProgress = {
  criteria: {
    supporters: ApiGateCriterion;
    weightedInterest: ApiGateCriterion;
    feedbackCount: ApiGateCriterion;
    feedbackScore: ApiGateCriterion;
  };
  meetsThreshold: boolean;
  requiredWeighted: number;
};

export type ApiIdea = {
  id: string;
  slug: string;
  title: string;
  problem: string;
  solution: string;
  targetUser: string;
  currentAlternative: string;
  askAmount: string | number;
  askBreakdown: unknown;
  roadmapSteps: unknown;
  category: string;
  region: string | null;
  coverImageUrl: string | null;
  demoUrl: string | null;
  risks: string | null;
  status: string;
  discoverabilityTier: string;
  validatingSince: string | null;
  createdAt: string;
  updatedAt?: string;
  weightedPrePledgeTotal: string | number | null;
  supporterCount: number | null;
  feedbackCount: number | null;
  feedbackScore: string | number | null;
  taxonomy: { category: string | null; subcategory: string | null } | null;
  creator: ApiCreator | null;
  gateProgress: ApiGateProgress;
  promoted: boolean;
};

type ApiListPage<Row> = {
  data: Row[];
  page: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

const PAGE_LIMIT = 50;
const MAX_IDEAS = 300;
const MAX_MY_IDEAS = 100;

const DISCOVERY_CATEGORY_BY_LEGACY: Readonly<
  Record<string, DiscoveryCategory>
> = {
  agriculture: "agriculture",
  agritech: "agriculture",
  art: "creative",
  cleantech: "clean-energy",
  comics: "creative",
  community: "community",
  crafts: "creative",
  dance: "creative",
  design: "creative",
  "e-commerce": "technology",
  edtech: "technology",
  fashion: "creative",
  film: "creative",
  fintech: "technology",
  food: "food-retail",
  games: "creative",
  healthtech: "technology",
  journalism: "creative",
  logistics: "technology",
  music: "creative",
  other: "creative",
  photography: "creative",
  publishing: "creative",
  software: "technology",
  technology: "technology",
  theater: "creative",
  web3: "technology",
};

const DISCOVERY_CATEGORY_BY_TAXONOMY: Readonly<
  Record<IdeaCategorySlug, DiscoveryCategory>
> = {
  art: "creative",
  comics: "creative",
  crafts: "creative",
  dance: "creative",
  design: "creative",
  fashion: "creative",
  film: "creative",
  food: "food-retail",
  games: "creative",
  journalism: "creative",
  music: "creative",
  photography: "creative",
  publishing: "creative",
  technology: "technology",
  theater: "creative",
};

const ARTWORK_BY_DISCOVERY: Readonly<
  Record<DiscoveryCategory, IdeaArtworkVariant>
> = {
  agriculture: "community",
  "clean-energy": "energy",
  community: "community",
  creative: "creative",
  "food-retail": "food",
  technology: "campus",
};

/**
 * Compatibility taxonomy for ideas created before the builder wrote a
 * `taxonomy` pair.
 *
 * The API stores the legacy `category` even when no canonical taxonomy is
 * assigned. Treating that legacy value as unassigned is what made those ideas
 * invisible to every category filter, even though their detail page still
 * showed a category. This deterministic map is a fallback only: an explicit
 * API taxonomy always wins, and a legacy value with no honest parent
 * (`community`, `other`) stays unassigned rather than being forced into one.
 */
const TAXONOMY_BY_LEGACY: Readonly<Record<string, IdeaCategorySlug>> = {
  art: "art",
  comics: "comics",
  crafts: "crafts",
  dance: "dance",
  design: "design",
  fashion: "fashion",
  film: "film",
  food: "food",
  games: "games",
  journalism: "journalism",
  music: "music",
  photography: "photography",
  publishing: "publishing",
  theater: "theater",
  technology: "technology",
  software: "technology",
  fintech: "technology",
  agritech: "technology",
  healthtech: "technology",
  cleantech: "technology",
  edtech: "technology",
  logistics: "technology",
  "e-commerce": "technology",
  web3: "technology",
};

function taxonomyCategoryFor(idea: ApiIdea): IdeaCategorySlug | undefined {
  return (
    taxonomySlug(idea.taxonomy?.category) ??
    TAXONOMY_BY_LEGACY[idea.category.trim().toLowerCase()]
  );
}

function taxonomySlug(
  value: string | null | undefined,
): IdeaCategorySlug | undefined {
  return value && isIdeaCategorySlug(value) ? value : undefined;
}

function taxonomyChildSlug(
  category: IdeaCategorySlug | undefined,
  value: string | null | undefined,
): IdeaSubcategorySlug | undefined {
  return category && value && isIdeaSubcategoryOf(category, value)
    ? (value as IdeaSubcategorySlug)
    : undefined;
}

export function discoveryCategoryFor(
  legacyCategory: string,
  taxonomyCategory: IdeaCategorySlug | undefined,
): DiscoveryCategory {
  return (
    DISCOVERY_CATEGORY_BY_LEGACY[legacyCategory] ??
    (taxonomyCategory
      ? DISCOVERY_CATEGORY_BY_TAXONOMY[taxonomyCategory]
      : undefined) ??
    "creative"
  );
}

export function regionFor(region: string | null): IdeaRegion {
  const text = region?.trim().toLocaleLowerCase() ?? "";
  if (/nigeria|lagos|abuja|ibadan|kano|port harcourt/.test(text)) {
    return "nigeria";
  }
  if (/ghana|accra|kumasi/.test(text)) return "ghana";
  if (/senegal|dakar/.test(text)) return "senegal";
  return "other";
}

/**
 * The lowest gate criterion as a whole percent.
 *
 * A single criterion can be at 100% while another is at 10%. Reporting the
 * average would overstate readiness, so the card shows the weakest link. The
 * API does not expose one combined percent.
 */
export function validationPercentFor(
  gate: ApiGateProgress | undefined,
): number {
  if (!gate) return 0;
  const values = Object.values(gate.criteria).map((criterion) => criterion.pct);
  if (values.length === 0) return 0;
  const lowest = Math.min(...values);
  return Math.max(0, Math.min(100, Math.round(lowest * 100)));
}

function toAmount(value: string | number | null | undefined): MoneyAmount {
  return decimalToUsdAmount(value);
}

function humanizeKey(key: string): string {
  const words = key.replace(/[_-]+/g, " ").trim();
  return words ? words[0]!.toLocaleUpperCase() + words.slice(1) : key;
}

/**
 * The API stores `askBreakdown` as an object keyed by cost line. The web's
 * detail view renders an ordered list, so entries become items. Non-numeric
 * values are skipped rather than shown as $0.
 */
export function toAskBreakdown(value: unknown): AskBreakdownItem[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const record = entry as Record<string, unknown>;
      if (typeof record.label !== "string" || !record.label.trim()) return [];
      if (
        typeof record.amount !== "number" &&
        typeof record.amount !== "string"
      ) {
        return [];
      }
      try {
        return [
          {
            amount: decimalToUsdAmount(record.amount),
            label: record.label.trim(),
          },
        ];
      } catch {
        return [];
      }
    });
  }

  if (!value || typeof value !== "object") return [];

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, raw]) => {
      if (typeof raw !== "number" && typeof raw !== "string") return [];
      try {
        return [{ amount: decimalToUsdAmount(raw), label: humanizeKey(key) }];
      } catch {
        return [];
      }
    },
  );
}

export function toRoadmapSteps(value: unknown): RoadmapStep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (
      typeof record.date !== "string" ||
      typeof record.description !== "string" ||
      !record.date.trim() ||
      !record.description.trim()
    ) {
      return [];
    }
    return [
      {
        date: record.date.trim(),
        description: record.description.trim(),
      },
    ];
  });
}

function publishedAtFor(idea: ApiIdea): string {
  return idea.validatingSince ?? idea.createdAt;
}

const STATUS_BY_API: Readonly<Record<string, IdeaStatus>> = {
  ARCHIVED: "archived",
  CONVERTED: "converted",
  DRAFT: "draft",
  THRESHOLD_MET: "threshold-met",
  VALIDATING: "validating",
};

/** Maps the API workflow enum without guessing at an unknown future value. */
export function ideaStatusFor(
  status: string | null | undefined,
): IdeaStatus | null {
  return status ? (STATUS_BY_API[status] ?? null) : null;
}

export function isReadableIdea(idea: ApiIdea): boolean {
  // DRAFT is unpublished. LINK_ONLY is deliberately reachable by direct URL
  // (FR-272), so it is readable but marked private below.
  return idea.status !== "DRAFT";
}

export function toDiscoveryIdea(idea: ApiIdea): DiscoveryIdea {
  const taxonomyCategory = taxonomyCategoryFor(idea);
  const taxonomySubcategory = taxonomyChildSlug(
    taxonomyCategory,
    idea.taxonomy?.subcategory,
  );
  const discoveryCategory = discoveryCategoryFor(
    idea.category,
    taxonomyCategory,
  );
  const creator = creatorNameFor(idea.creator);
  const creatorUsername = publicHandleFor(idea.creator);

  const publishedAt = publishedAtFor(idea);
  const publishedOrder = Date.parse(publishedAt);

  return {
    artwork: ARTWORK_BY_DISCOVERY[discoveryCategory],
    category: taxonomyCategory
      ? ideaCategoryLabel(taxonomyCategory)
      : idea.category,
    cover: idea.coverImageUrl,
    creator,
    creatorInitials: initialsFor(creator),
    ...(creatorUsername ? { creatorUsername } : {}),
    description: idea.problem || idea.solution,
    discoveryCategory,
    feedbackResponses: idea.feedbackCount ?? 0,
    id: idea.id,
    location: idea.region?.trim() || "Location not shared",
    prePledged: toAmount(idea.weightedPrePledgeTotal),
    promoted: idea.promoted,
    publishedOrder: Number.isFinite(publishedOrder) ? publishedOrder : 0,
    region: regionFor(idea.region),
    ...(idea.slug ? { slug: idea.slug } : {}),
    supporters: idea.supporterCount ?? 0,
    ...(taxonomyCategory ? { taxonomyCategory } : {}),
    ...(taxonomySubcategory ? { taxonomySubcategory } : {}),
    title: idea.title,
    validationPercent: validationPercentFor(idea.gateProgress),
    visibility: idea.discoverabilityTier === "LINK_ONLY" ? "private" : "public",
  };
}

/**
 * A creator's own row, or `null` when the API reports a status this client does
 * not know. The studio never guesses a lifecycle label for a future enum value;
 * the caller can omit that row rather than mislabel it.
 */
export function toMyIdea(idea: ApiIdea): MyIdea | null {
  const status = ideaStatusFor(idea.status);
  if (!status) return null;

  const discovery = toDiscoveryIdea(idea);
  // Mirror the public list: only a validating or threshold-met idea with a
  // discoverable tier is actually listed. A stale tier on an archived or
  // converted row must not inflate the studio's "published" count.
  const listed =
    (status === "validating" || status === "threshold-met") &&
    discovery.visibility === "public";

  return {
    artwork: discovery.artwork,
    category: discovery.category,
    cover: discovery.cover ?? null,
    discoveryCategory: discovery.discoveryCategory,
    id: idea.id,
    prePledged: discovery.prePledged,
    status,
    supporters: discovery.supporters,
    title: idea.title,
    updatedAt: idea.updatedAt ?? idea.createdAt,
    validationPercent: discovery.validationPercent,
    visibility: listed ? "public" : "private",
  };
}

export function toIdeaDetail(
  idea: ApiIdea,
  feedbackForm?: FeedbackForm,
): IdeaDetail {
  const base = toDiscoveryIdea(idea);
  const askAmount = toAmount(idea.askAmount);
  const status = ideaStatusFor(idea.status);
  const fundingIntent =
    BigInt(askAmount.atomic) > 0n
      ? {
          estimatedAsk: askAmount,
          nextStep: idea.gateProgress?.meetsThreshold
            ? "The validation gate is met. The next step is a campaign draft with milestone escrow."
            : "The next step is to meet the validation gate before a campaign draft opens.",
          useOfFunds: toAskBreakdown(idea.askBreakdown),
        }
      : undefined;
  // The API has no stored goal flags. A form or an ask is direct evidence of
  // the intent; community stays false because nothing in the response says the
  // creator enabled it. Never invent a goal from the page's layout.
  const goals =
    feedbackForm || fundingIntent
      ? {
          community: false,
          feedback: Boolean(feedbackForm),
          funding: Boolean(fundingIntent),
        }
      : undefined;

  return {
    ...base,
    askAmount,
    askBreakdown: toAskBreakdown(idea.askBreakdown),
    cover: idea.coverImageUrl,
    ...(idea.creator?.bio?.trim()
      ? { creatorBio: idea.creator.bio.trim() }
      : {}),
    creatorVerified: idea.creator?.identityVerified === true,
    ...(idea.demoUrl?.trim() ? { demoUrl: idea.demoUrl.trim() } : {}),
    feedbackScore: Number(idea.feedbackScore ?? 0),
    ...(feedbackForm ? { feedbackForm } : {}),
    ...(fundingIntent ? { fundingIntent } : {}),
    ...(goals ? { goals } : {}),
    gate: {
      minPrePledged: toAmount(
        idea.gateProgress?.criteria.weightedInterest.need ?? 0,
      ),
      minSupporters: idea.gateProgress?.criteria.supporters.need ?? 0,
    },
    problem: idea.problem,
    publishedAt: publishedAtFor(idea),
    ...(idea.risks?.trim() ? { risks: idea.risks.trim() } : {}),
    roadmapSteps: toRoadmapSteps(idea.roadmapSteps),
    solution: idea.solution,
    ...(status ? { status } : {}),
    targetUser: idea.targetUser,
    currentAlternative: idea.currentAlternative,
  };
}

async function fetchIdeaPage(options: {
  cursor?: string | null;
  limit?: number;
  mine?: boolean;
  taxonomyCategory?: IdeaCategorySlug;
  token?: string | null;
}): Promise<ApiListPage<ApiIdea>> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? PAGE_LIMIT),
  });
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.mine) params.set("mine", "true");
  if (options.taxonomyCategory) {
    params.set("taxonomyCategory", options.taxonomyCategory);
  }

  return fetchApiJson<ApiListPage<ApiIdea>>(`/ideas?${params.toString()}`, {
    ...(options.token ? { token: options.token } : {}),
  });
}

/**
 * A bounded live window.
 *
 * The discovery dashboard filters in the browser, so it needs the candidate
 * set, not one server page. The window is capped: past `MAX_IDEAS`, the page
 * says so instead of pretending the filtered counts cover the whole catalogue.
 * Server-side search and sorting are the follow-up that removes the cap.
 */
export async function getLiveIdeasWindow(
  options: {
    max?: number;
    taxonomyCategory?: IdeaCategorySlug;
  } = {},
): Promise<{ ideas: ApiIdea[]; truncated: boolean }> {
  const max = Math.max(PAGE_LIMIT, options.max ?? MAX_IDEAS);
  const ideas: ApiIdea[] = [];
  let cursor: string | null = null;

  while (ideas.length < max) {
    const page: ApiListPage<ApiIdea> = await fetchIdeaPage({
      cursor,
      limit: Math.min(PAGE_LIMIT, max - ideas.length),
      ...(options.taxonomyCategory
        ? { taxonomyCategory: options.taxonomyCategory }
        : {}),
    });
    ideas.push(...page.data);
    cursor = page.page.nextCursor;
    if (!cursor || page.data.length === 0) {
      return { ideas, truncated: false };
    }
  }

  return { ideas, truncated: cursor !== null };
}

export async function getLiveIdea(
  idOrSlug: string,
  options: { includeDraft?: boolean; token?: string | null } = {},
): Promise<ApiIdea | null> {
  try {
    const idea = await fetchApiJson<ApiIdea>(
      `/ideas/${encodeURIComponent(idOrSlug)}`,
      {
        ...(options.token ? { token: options.token } : {}),
      },
    );
    return options.includeDraft || isReadableIdea(idea) ? idea : null;
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export type ApiSurveyQuestion = {
  createdAt: string;
  id: string;
  index: number;
  options: unknown;
  prompt: string;
  required: boolean;
  type: string;
};

const FEEDBACK_TYPE_BY_SURVEY: Readonly<Record<string, FeedbackQuestionType>> =
  {
    BOOLEAN: "boolean",
    MULTI_CHOICE: "multi-choice",
    RATING: "rating",
    SINGLE_CHOICE: "single-choice",
    TEXT: "long-text",
  };

/**
 * The public survey as the respondent form.
 *
 * Question ids stay the API ids because answers are submitted against them.
 * Choice option ids are labels: the API stores and validates option strings,
 * not generated ids, so introducing a second id would break the round trip.
 */
export function toFeedbackForm(
  questions: readonly ApiSurveyQuestion[] | null | undefined,
): FeedbackForm | undefined {
  if (!questions || questions.length === 0) return undefined;

  const mapped: FeedbackQuestion[] = questions.flatMap((question) => {
    const type = FEEDBACK_TYPE_BY_SURVEY[question.type];
    if (!type) return [];
    const options = Array.isArray(question.options)
      ? question.options.filter(
          (option): option is string => typeof option === "string",
        )
      : [];
    return [
      {
        id: question.id,
        label: question.prompt,
        required: question.required,
        type,
        ...(options.length > 0
          ? {
              options: options.map((label) => ({
                id: label,
                label,
              })),
            }
          : {}),
      },
    ];
  });

  if (mapped.length === 0) return undefined;

  const updatedAt = questions.reduce(
    (latest, question) =>
      question.createdAt > latest ? question.createdAt : latest,
    questions[0]?.createdAt ?? new Date(0).toISOString(),
  );

  return {
    description:
      "A few honest answers help the creator decide what to build next.",
    enabled: true,
    published: true,
    questions: mapped,
    title: "Share your feedback",
    updatedAt,
    version: 1,
  };
}

export async function getLiveIdeaSurvey(
  idOrSlug: string,
): Promise<ApiSurveyQuestion[]> {
  return fetchApiJson<ApiSurveyQuestion[]>(
    `/ideas/${encodeURIComponent(idOrSlug)}/survey`,
  );
}

type ApiIdeaEngagement = {
  prePledge: { amountUsd: string } | null;
  supported: boolean;
};

/**
 * The signed-in viewer's own signals on one idea.
 *
 * `feedbackSubmitted` stays false because the public API does not expose an
 * anonymous submission receipt; claiming it from a local click would be a
 * different kind of lie. The form itself handles repeat submissions as an
 * upsert.
 */
export async function getLiveIdeaEngagement(
  idOrSlug: string,
  token: string,
): Promise<IdeaSignals> {
  const engagement = await fetchApiJson<ApiIdeaEngagement>(
    `/ideas/${encodeURIComponent(idOrSlug)}/engagement`,
    { token },
  );

  return {
    feedbackSubmitted: false,
    prePledge: engagement.prePledge
      ? { amount: decimalToUsdAmount(engagement.prePledge.amountUsd) }
      : null,
    supported: engagement.supported,
  };
}

type ApiIdeaComment = {
  id: string;
  body: string;
  createdAt: string;
  highlighted: boolean;
  likeCount: number;
  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isCreator: boolean;
  };
};

type ApiCommentPage = {
  data: ApiIdeaComment[];
  page: { hasMore: boolean; nextCursor: string | null };
};

export const COMMENT_PAGE_LIMIT = 20;

/**
 * The public discussion thread.
 *
 * Comment bodies are public; author identity is the API's projection and never
 * includes a wallet, email or internal user id beyond the opaque account id.
 * A failed or missing thread is the caller's decision - this function throws so
 * the page can distinguish "no comments" from "could not load".
 */
export async function getLiveIdeaComments(
  idOrSlug: string,
  limit = COMMENT_PAGE_LIMIT,
): Promise<{ comments: IdeaComment[]; hasMore: boolean }> {
  try {
    const page = await fetchApiJson<ApiCommentPage>(
      `/ideas/${encodeURIComponent(idOrSlug)}/comments?limit=${limit}`,
    );

    return {
      comments: page.data.map((comment) => {
        const author = creatorNameFor({
          displayName: comment.author.displayName,
          id: comment.author.id,
          username: comment.author.id,
        });
        return {
          author,
          authorInitials: initialsFor(author),
          body: comment.body,
          createdAt: comment.createdAt,
          id: comment.id,
          pinned: comment.highlighted,
        };
      }),
      hasMore: page.page.hasMore,
    };
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      return { comments: [], hasMore: false };
    }
    throw error;
  }
}

/**
 * The signed-in creator's own ideas, newest first.
 *
 * This is the analytics index's read. `mine=true` is authenticated at the API,
 * so the web never assembles an owner list from a public catalogue. The window
 * is bounded; a creator with more than `MAX_MY_IDEAS` ideas gets the newest
 * slice rather than an unbounded page loop.
 */
export async function getLiveMyIdeas(
  token: string,
  max = MAX_MY_IDEAS,
): Promise<{ ideas: ApiIdea[]; truncated: boolean }> {
  const limit = Math.min(Math.max(0, Math.trunc(max)), MAX_MY_IDEAS);
  const ideas: ApiIdea[] = [];
  let cursor: string | null = null;

  if (limit === 0) return { ideas, truncated: false };

  while (ideas.length < limit) {
    const page = await fetchIdeaPage({
      cursor,
      limit: Math.min(PAGE_LIMIT, limit - ideas.length),
      mine: true,
      token,
    });

    ideas.push(...page.data);
    cursor = page.page.nextCursor;
    if (!cursor || page.data.length === 0) {
      return { ideas, truncated: false };
    }
  }

  return { ideas, truncated: cursor !== null };
}

export { MAX_IDEAS, MAX_MY_IDEAS, PAGE_LIMIT };
