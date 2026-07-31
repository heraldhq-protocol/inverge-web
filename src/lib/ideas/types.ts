import type { FeedItem, PublicCreator } from '@/lib/feed/types';
import type { TiptapDoc } from './rich-content';

/** A dated roadmap step (FR-270 structured pitch: at least two). */
export type RoadmapStep = { date: string; description: string };

/** One line of the indicative ask breakdown. `amount` is USD. */
export type AskLine = { label: string; amount: number };

/**
 * Idea detail. Extends the feed item because the card and the page show the same metrics and must
 * never disagree about them.
 */
export type IdeaDetail = Omit<FeedItem, 'reason' | 'promoted' | 'exploration' | 'boostTier'> & {
  roadmap: string;
  /**
   * The pitch body as a Tiptap document, when the creator wrote one. Plain `solution` stays the
   * fallback and the source for cards and meta descriptions, so nothing breaks for an idea written
   * before the editor existed.
   */
  solutionDoc?: TiptapDoc | null;
  targetUser: string | null;
  currentAlternative: string | null;
  askBreakdown: AskLine[] | null;
  roadmapSteps: RoadmapStep[] | null;
  /** Optional today, and only in fixtures: no risks field exists on an idea yet (backlog item 8). */
  risks?: string | null;
  createdAt: string;
  publishedAt: string | null;
  creator: PublicCreator & {
    bio?: string | null;
    tier: 'STARTER' | 'TRUSTED' | 'ESTABLISHED';
    completedCampaigns: number;
    ideasPublished: number;
    memberSince: string;
  };
};

/**
 * A creator update. There is no update model on an idea in the API yet (it exists as an ask for
 * campaigns, backlog item 8), so this is fixture-shaped for now.
 *
 * `supportersOnly` gates the body, never the fact that a post exists: showing who posted and when,
 * and hiding only the content, is the honest form of a gate (teardown §5.5).
 */
export type IdeaUpdate = {
  id: string;
  index: number;
  title: string;
  body: string;
  publishedAt: string;
  supportersOnly: boolean;
  commentCount: number;
  likeCount: number;
};

/**
 * Where support is coming from.
 *
 * Aggregate only, and deliberately coarse. A public version of this needs its own endpoint and its own
 * privacy pass: minimum bucket sizes, so a city with two supporters cannot identify them, and nothing
 * that reverses into an individual's pre-pledge amount (API gap backlog item 11). Until then this is
 * the creator's own view of their own idea.
 */
export type SupportPlace = {
  place: string;
  country: string;
  supporters: number;
};

export type SurveyQuestionType =
  | 'RATING'
  | 'TEXT'
  | 'SINGLE_CHOICE'
  | 'MULTI_CHOICE'
  | 'BOOLEAN';

export type SurveyQuestion = {
  id: string;
  index: number;
  type: SurveyQuestionType;
  prompt: string;
  required: boolean;
  options: string[] | null;
};

/** Public aggregate of the responses to one question. */
export type SurveyAggregate =
  | { questionId: string; type: 'RATING'; responses: number; average: number; histogram: number[] }
  | { questionId: string; type: 'BOOLEAN'; responses: number; yes: number; no: number }
  | {
      questionId: string;
      type: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
      responses: number;
      tally: { option: string; count: number }[];
    }
  | { questionId: string; type: 'TEXT'; responses: number; samples: string[] };

/**
 * A comment. `author` is fixture-supplied: the live endpoint returns a bare `userId` today, which is
 * why the thread cannot be built against it yet (backlog item 2).
 */
export type IdeaComment = {
  id: string;
  parentId: string | null;
  body: string;
  likeCount: number;
  likedByMe: boolean;
  highlighted: boolean;
  /** Moderation tombstone: the row stays, the body does not (teardown §5.6). */
  removed?: boolean;
  createdAt: string;
  author: PublicCreator & { isCreator: boolean };
};
