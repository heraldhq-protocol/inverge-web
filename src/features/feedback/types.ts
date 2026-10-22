/** Why a creator published the idea. Goals are optional and independent. */
export type IdeaSupportGoal = "community" | "feedback" | "funding";

export type IdeaGoals = Readonly<Record<IdeaSupportGoal, boolean>>;

export const IDEA_GOAL_META: Readonly<
  Record<
    IdeaSupportGoal,
    { description: string; label: string; shortLabel: string }
  >
> = {
  feedback: {
    description:
      "Ask people who understand the problem to review it and tell you what would make it stronger.",
    label: "Feedback and validation",
    shortLabel: "Feedback",
  },
  community: {
    description:
      "Grow an audience of early adopters and supporters who want to follow progress.",
    label: "Community and supporters",
    shortLabel: "Community",
  },
  funding: {
    description:
      "Explore non-binding funding interest for a future campaign. This does not open a raise.",
    label: "Funding interest or future campaign",
    shortLabel: "Funding interest",
  },
};

/**
 * Question types the product presents.
 *
 * `SHORT_TEXT` and `LONG_TEXT` both persist as the API's `TEXT`; the distinction
 * only changes the input height and the analytics summary. `SCALE` persists as
 * `RATING` with explicit min/max labels, so answers keep their numeric meaning.
 */
export type FeedbackQuestionType =
  | "short-text"
  | "long-text"
  | "single-choice"
  | "multi-choice"
  | "rating"
  | "boolean"
  | "scale";

export const FEEDBACK_QUESTION_META: Readonly<
  Record<
    FeedbackQuestionType,
    { description: string; label: string; supportsOptions: boolean }
  >
> = {
  "short-text": {
    label: "Short text",
    description: "A single line, such as a name or a one-sentence answer.",
    supportsOptions: false,
  },
  "long-text": {
    label: "Long text",
    description: "A paragraph response with room to explain.",
    supportsOptions: false,
  },
  "single-choice": {
    label: "Single choice",
    description: "Pick exactly one option from a list.",
    supportsOptions: true,
  },
  "multi-choice": {
    label: "Checkboxes",
    description: "Pick any number of options from a list.",
    supportsOptions: true,
  },
  rating: {
    label: "Star rating",
    description:
      "A 1 to 5 rating. Only these questions contribute to the average rating.",
    supportsOptions: false,
  },
  boolean: {
    label: "Yes or no",
    description: "A single yes or no answer.",
    supportsOptions: false,
  },
  scale: {
    label: "Choice scale",
    description: "A numbered range with labels at each end, such as 1 to 5.",
    supportsOptions: false,
  },
};

export type FeedbackOption = {
  id: string;
  label: string;
};

export type FeedbackScale = {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
};

export type FeedbackQuestion = {
  id: string;
  label: string;
  type: FeedbackQuestionType;
  required: boolean;
  helpText?: string | undefined;
  options?: readonly FeedbackOption[] | undefined;
  scale?: FeedbackScale | undefined;
};

export type FeedbackForm = {
  enabled: boolean;
  title: string;
  description: string;
  questions: readonly FeedbackQuestion[];
  /** Increments when a published form changes, so old answers stay attributed. */
  version: number;
  updatedAt: string;
  /** Preview-only: a draft has not been published to respondents. */
  published: boolean;
};

export type FeedbackAnswerValue = string | string[] | number | boolean;

export type FeedbackAnswers = Record<string, FeedbackAnswerValue>;

export type FeedbackSubmission = {
  answers: FeedbackAnswers;
  formVersion: number;
  ideaId: string;
  submittedAt: string;
};

export type FeedbackDraft = {
  answers: FeedbackAnswers;
  formVersion: number;
  ideaId: string;
  updatedAt: string;
};

export type CommunityDestinationKind =
  | "website"
  | "whatsapp"
  | "telegram"
  | "discord"
  | "newsletter"
  | "profile"
  | "other";

export const COMMUNITY_DESTINATION_META: Readonly<
  Record<CommunityDestinationKind, { label: string; placeholder: string }>
> = {
  website: {
    label: "Website",
    placeholder: "https://yourcommunity.com",
  },
  whatsapp: {
    label: "WhatsApp",
    placeholder: "https://chat.whatsapp.com/...",
  },
  telegram: {
    label: "Telegram",
    placeholder: "https://t.me/...",
  },
  discord: {
    label: "Discord",
    placeholder: "https://discord.gg/...",
  },
  newsletter: {
    label: "Newsletter",
    placeholder: "https://yournewsletter.com/subscribe",
  },
  profile: {
    label: "Inverge profile",
    placeholder: "/creators/your-handle",
  },
  other: {
    label: "Other community",
    placeholder: "https://...",
  },
};

export type CommunityDestination = {
  id: string;
  kind: CommunityDestinationKind;
  label: string;
  url: string;
  enabled: boolean;
};

export type CommunityInvite = {
  enabled: boolean;
  title: string;
  description: string;
  primaryDestinationId: string | null;
  showAfterFeedback: boolean;
  showOnIdeaPage: boolean;
  destinations: readonly CommunityDestination[];
};

/** A creator's public follow state, as returned by the account projection. */
export type CreatorFollow = {
  creatorId: string;
  creatorHandle: string;
  followerCount: number;
  isFollowing: boolean;
};
