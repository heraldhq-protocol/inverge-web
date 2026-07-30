import type { FeedItem, PublicCreator } from '@/lib/feed/types';

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
