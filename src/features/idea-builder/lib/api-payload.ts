import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { FeedbackForm } from "@/features/feedback/types";
import type { IdeaDraft } from "@/features/idea-builder/types";

const API_CATEGORY: Readonly<Record<DiscoveryCategory, string>> = {
  agriculture: "agritech",
  "clean-energy": "cleantech",
  community: "community",
  creative: "art",
  "food-retail": "food",
  technology: "technology",
};

export type IdeaApiPayload = {
  askAmount?: number;
  askBreakdown?: Record<string, number>;
  category: string;
  coverImageUrl?: string;
  currentAlternative: string;
  problem: string;
  region?: string;
  risks?: string;
  roadmapSteps?: { date: string; description: string }[];
  solution: string;
  targetUser: string;
  title: string;
};

type SurveyQuestion =
  | "BOOLEAN"
  | "MULTI_CHOICE"
  | "RATING"
  | "SINGLE_CHOICE"
  | "TEXT";

export type SurveyApiPayload = {
  questions: {
    index: number;
    options?: string[];
    prompt: string;
    required: boolean;
    type: SurveyQuestion;
  }[];
};

const SURVEY_TYPE: Readonly<
  Record<FeedbackForm["questions"][number]["type"], SurveyQuestion>
> = {
  boolean: "BOOLEAN",
  "long-text": "TEXT",
  "multi-choice": "MULTI_CHOICE",
  rating: "RATING",
  scale: "RATING",
  "short-text": "TEXT",
  "single-choice": "SINGLE_CHOICE",
};

/**
 * Maps the browser draft onto the API's create/update contract.
 *
 * Fields the API does not store yet (`summary`, community destinations) are
 * deliberately omitted rather than smuggled into another column. The page keeps
 * them in the browser draft and tells the creator they are not persisted live.
 */
export function toIdeaApiPayload(draft: IdeaDraft): IdeaApiPayload {
  const useOfFunds = Object.fromEntries(
    draft.funding.useOfFunds.flatMap((entry) => {
      const amount = Number(entry.amount);
      const label = entry.label.trim();
      if (!label || !Number.isFinite(amount) || amount <= 0) return [];
      return [[label, amount]];
    }),
  );
  const roadmapSteps = draft.roadmapSteps
    .map((step) => ({
      date: step.date.trim(),
      description: step.description.trim(),
    }))
    .filter((step) => step.date && step.description);

  return {
    title: draft.title.trim(),
    problem: draft.problem.trim(),
    solution: draft.solution.trim(),
    targetUser: draft.targetUser.trim(),
    currentAlternative: draft.currentAlternative.trim(),
    category: draft.category ? API_CATEGORY[draft.category] : "other",
    ...(draft.region.trim() ? { region: draft.region.trim() } : {}),
    ...(draft.coverUrl.trim()
      ? { coverImageUrl: draft.coverUrl.trim() }
      : {}),
    ...(draft.risks.trim() ? { risks: draft.risks.trim() } : {}),
    ...(draft.goals.funding
      ? { askAmount: Number(draft.funding.askAmount) || 0 }
      : {}),
    ...(Object.keys(useOfFunds).length > 0 ? { askBreakdown: useOfFunds } : {}),
    ...(roadmapSteps.length > 0 ? { roadmapSteps } : {}),
  };
}

export function toSurveyApiPayload(form: FeedbackForm): SurveyApiPayload {
  return {
    questions: form.questions.slice(0, 20).map((question, index) => ({
      index,
      prompt: question.label.trim(),
      type: SURVEY_TYPE[question.type],
      required: question.required,
      ...(question.options && question.options.length > 0
        ? {
            options: question.options
              .map((option) => option.label.trim())
              .filter(Boolean),
          }
        : {}),
    })),
  };
}
