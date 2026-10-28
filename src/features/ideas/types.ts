import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { IdeaArtworkVariant, IdeaSummary } from "@/features/home/types";
import type {
  CommunityInvite,
  CreatorFollow,
  FeedbackForm,
  IdeaGoals,
} from "@/features/feedback/types";
import type {
  IdeaCategorySlug,
  IdeaSubcategorySlug,
} from "@/features/ideas/lib/taxonomy";
import type { MoneyAmount } from "@/lib/money";

export type IdeaRegion = "ghana" | "nigeria" | "other" | "senegal";

/**
 * Whether an idea is listed in discovery.
 *
 * Deliberately orthogonal to `IdeaStatus` and to the backend's algorithmic
 * `discoverabilityTier`: private means unlisted, not locked. Anyone holding the
 * link can still read the idea and interact with it, so discovery surfaces are
 * the only place this field filters.
 */
export type IdeaVisibility = "public" | "private";

/** Mirrors the backend's idea lifecycle; `visibility` is independent of it. */
export type IdeaStatus =
  "archived" | "converted" | "draft" | "threshold-met" | "validating";

/**
 * Which ideas a surface may show. Discovery routes stay `public`; a creator's
 * own surfaces pass `all`.
 */
export type IdeaScope = "all" | "public";

export type DiscoveryIdea = IdeaSummary & {
  /** Editorial cover, or `null` for the deterministic artwork fallback. */
  cover?: string | null;
  /** Stored public handle, when the creator has one. Never an internal id. */
  creatorUsername?: string;
  /**
   * The idea's category in the shared campaign/idea discovery taxonomy.
   *
   * Optional because older records and the API projection may not carry one.
   * Such an idea still appears under "All categories", but is never counted
   * under a category it does not have. This is the filter taxonomy, not the
   * broader `discoveryCategory` bucket used by the idea builder and ideathon.
   */
  taxonomyCategory?: IdeaCategorySlug;
  /**
   * The idea's subcategory in the shared taxonomy.
   *
   * Only meaningful with `taxonomyCategory`; the URL parser requires the child
   * to belong to the selected parent. An idea without a child is counted under
   * its parent and "All subcategories", never under a child it does not have.
   */
  taxonomySubcategory?: IdeaSubcategorySlug;
  /** FR-203: count of structured survey responses. Volume, never a score. */
  feedbackResponses: number;
  location: string;
  promoted?: boolean;
  publishedOrder: number;
  region: IdeaRegion;
  visibility: IdeaVisibility;
};

export type IdeaValidationStage = "early" | "growing" | "near";

export type IdeaSort = "most-supported" | "most-validated" | "newest";

export type IdeasDiscoveryData = {
  featured: DiscoveryIdea[];
  ideas: DiscoveryIdea[];
};

/** FR-204: what an idea must reach before it can become a campaign draft. */
export type IdeaGateThresholds = {
  minPrePledged: MoneyAmount;
  minSupporters: number;
};

/** FR-270: one dated roadmap step. Status is never inferred from a passed date. */
export type RoadmapStep = {
  /** ISO date (or period label). */
  date: string;
  description: string;
};

/** One line of the indicative ask breakdown; sums to `askAmount`. */
export type AskBreakdownItem = {
  label: string;
  amount: MoneyAmount;
};

export type IdeaDetail = DiscoveryIdea & {
  /** Unsplash address, or `null` to fall back to the gradient cover. */
  cover: string | null;
  gate: IdeaGateThresholds;
  publishedAt: string;
  /** What the creator is asking for. Optional; older records may omit it. */
  goals?: IdeaGoals | undefined;
  /** The creator-configured feedback form. Absent or disabled means no form. */
  feedbackForm?: FeedbackForm | undefined;
  /** Optional post-feedback / on-page community invitation. */
  community?: CommunityInvite | undefined;
  /** Public follow projection for this creator. */
  creatorFollow?: CreatorFollow | undefined;
  /** Funding intent fields, shown only when the funding goal is enabled. */
  fundingIntent?:
    | {
        estimatedAsk: MoneyAmount;
        useOfFunds: readonly { label: string; amount: MoneyAmount }[];
        nextStep: string;
      }
    | undefined;
  /**
   * FR-270 structured pitch. Field names mirror `CreateIdeaDto` in
   * `inverge-api`, so swapping preview fixtures for the API payload is a
   * rename-free change.
   */
  problem: string;
  targetUser: string;
  currentAlternative: string;
  solution: string;
  roadmapSteps: readonly RoadmapStep[];
  askBreakdown: readonly AskBreakdownItem[];
  askAmount: MoneyAmount;
  /** P2 coaching context (risks & challenges); rendered only when present. */
  risks?: string;
  /** FR-203: average survey rating 0–5, shown as feedback, never as demand. */
  feedbackScore: number;
  /**
   * API workflow status. Optional because fixtures may omit it; a missing value
   * must not be read as "draft" or "published".
   */
  status?: IdeaStatus;

  // Quality and accountability signals. All optional so the fixture only
  // declares what it actually holds, and every section renders conditionally.
  /** KYC-verified creator identity; drives the verification badge. */
  creatorVerified?: boolean;
  /** Past work — the credibility block a supporter uses to judge the ask. */
  creatorBio?: string;
  /** Share of feedback the creator has responded to, 0–1. */
  responseRate?: number;
  /** "Changed after feedback" log, newest first. */
  changes?: readonly { date: string; description: string }[];
  /** A demo, mockup, or prototype link. */
  demoUrl?: string;
  /** How many supporters passed verification (never exceeds `supporters`). */
  verifiedSupporters?: number;
  /** Where supporters are, e.g. local vs. diaspora. */
  supportersByRegion?: readonly { label: string; count: number }[];
};

/**
 * The detail-only fields, split out from `IdeaDetail` so a fixture can keep the
 * pitch next to the summaries it belongs to without repeating every field.
 */
export type IdeaDetailRecord = Omit<
  IdeaDetail,
  Exclude<keyof DiscoveryIdea, "cover">
>;

export type IdeaComment = {
  author: string;
  authorInitials: string;
  body: string;
  createdAt: string;
  id: string;
  pinned?: boolean;
};

export type IdeaUpdate = {
  body: string;
  createdAt: string;
  id: string;
  title: string;
};

export type SurveyQuestion = {
  id: string;
  kind: "free-text" | "multi-choice" | "rating" | "single-choice";
  options: string[];
  prompt: string;
  required: boolean;
};

export type SurveyTally = {
  count: number;
  option: string;
};

export type SurveyAggregate = {
  quotes: string[];
  questions: SurveyQuestion[];
  responses: number;
  /** Tallies by question id; free-text questions carry none. */
  tallies: Record<string, SurveyTally[]>;
};

export type InsightFunnelStep = {
  count: number;
  label: string;
};

export type InsightSource = {
  label: string;
  visits: number;
};

export type InsightSegment = {
  label: string;
  /** Share of responses, 0–1. */
  share: number;
};

export type IdeaInsights = {
  comments: number;
  /** Share of viewers who opened the survey, 0–1. */
  coverRate: number;
  feedbackResponses: number;
  funnel: InsightFunnelStep[];
  prePledged: MoneyAmount;
  segments: InsightSegment[];
  sources: InsightSource[];
  survey: SurveyAggregate;
  supporters: number;
  views: number;
};

/** A row on a creator's own ideas surface; the viewer is the creator. */
export type MyIdea = {
  artwork: IdeaArtworkVariant;
  category: string;
  cover: string | null;
  discoveryCategory: DiscoveryCategory;
  id: string;
  prePledged: MoneyAmount;
  status: IdeaStatus;
  supporters: number;
  title: string;
  updatedAt: string;
  validationPercent: number;
  visibility: IdeaVisibility;
};

export type Topic = {
  description: string;
  /** Ids of every idea in the topic, public and private; filter before showing. */
  ideaIds: string[];
  slug: string;
  title: string;
};
