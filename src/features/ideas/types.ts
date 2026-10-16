import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { IdeaArtworkVariant, IdeaSummary } from "@/features/home/types";
import type { MoneyAmount } from "@/lib/money";
import type { TiptapDoc } from "@/lib/rich-text";

export type IdeaRegion = "ghana" | "nigeria" | "senegal";

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

export type IdeaDetail = DiscoveryIdea & {
  /** Unsplash address, or `null` to fall back to the gradient cover. */
  cover: string | null;
  gate: IdeaGateThresholds;
  publishedAt: string;
  story: TiptapDoc;
};

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
  kind: "free-text" | "multi-choice" | "single-choice";
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
