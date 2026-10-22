import type { AnalyticsDataset } from "@/features/analytics/content/preview-analytics";
import type {
  FeedbackAnswers,
  FeedbackForm,
  FeedbackQuestion,
} from "@/features/feedback/types";

export type ChoiceTally = {
  label: string;
  count: number;
  share: number;
};

export type QuestionSummary = {
  question: FeedbackQuestion;
  answered: number;
  tallies: readonly ChoiceTally[];
  ratingAverage: number | null;
  ratingDistribution: readonly { rating: number; count: number }[];
  textAnswers: readonly string[];
};

export type FeedbackSummary = {
  responseCount: number;
  configured: boolean;
  hasRating: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  questions: readonly QuestionSummary[];
};

type Submission = { answers: FeedbackAnswers; formVersion: number };

function uniqueTextAnswers(values: readonly string[], limit = 6): string[] {
  const seen = new Set<string>();
  const answers: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed.length < 3) continue;
    const key = trimmed.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    answers.push(trimmed);
    if (answers.length >= limit) break;
  }

  return answers;
}

/**
 * Aggregate real submissions against the questions they were asked.
 *
 * Only answers from the current published form version are counted, because a
 * different version may have asked a different question at the same id. A rating
 * average is returned only when the form actually configures a rating question;
 * choice and text answers are never folded into a score.
 */
export function summariseFeedback(
  form: FeedbackForm | undefined,
  submissions: readonly Submission[],
): FeedbackSummary {
  if (!form || !form.enabled || form.questions.length === 0) {
    return {
      responseCount: 0,
      configured: false,
      hasRating: false,
      ratingAverage: null,
      ratingCount: 0,
      questions: [],
    };
  }

  const current = submissions.filter(
    (submission) => submission.formVersion === form.version,
  );
  const ratingQuestions = form.questions.filter(
    (question) => question.type === "rating",
  );

  const questions = form.questions.map((question): QuestionSummary => {
    const values = current
      .map((submission) => submission.answers[question.id])
      .filter((value) => value !== undefined);

    if (question.type === "rating" || question.type === "scale") {
      const numbers = values.filter(
        (value): value is number => typeof value === "number",
      );
      const min = question.type === "rating" ? 1 : (question.scale?.min ?? 1);
      const max = question.type === "rating" ? 5 : (question.scale?.max ?? 5);
      const distribution = Array.from(
        { length: max - min + 1 },
        (_, index) => min + index,
      ).map((rating) => ({
        rating,
        count: numbers.filter((value) => value === rating).length,
      }));

      return {
        question,
        answered: numbers.length,
        tallies: [],
        ratingAverage:
          numbers.length > 0
            ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
            : null,
        ratingDistribution: distribution,
        textAnswers: [],
      };
    }

    if (question.type === "single-choice" || question.type === "multi-choice") {
      const options = question.options ?? [];
      const counts = new Map<string, number>(
        options.map((option) => [option.label, 0]),
      );

      for (const value of values) {
        const picks = Array.isArray(value) ? value : [value];
        for (const pick of picks) {
          if (typeof pick !== "string") continue;
          counts.set(pick, (counts.get(pick) ?? 0) + 1);
        }
      }

      const answered = values.length;
      return {
        question,
        answered,
        tallies: options.map((option) => ({
          label: option.label,
          count: counts.get(option.label) ?? 0,
          share: answered > 0 ? (counts.get(option.label) ?? 0) / answered : 0,
        })),
        ratingAverage: null,
        ratingDistribution: [],
        textAnswers: [],
      };
    }

    if (question.type === "boolean") {
      const yes = values.filter((value) => value === true).length;
      const answered = values.length;
      const no = answered - yes;
      return {
        question,
        answered,
        tallies: [
          {
            label: "Yes",
            count: yes,
            share: answered > 0 ? yes / answered : 0,
          },
          { label: "No", count: no, share: answered > 0 ? no / answered : 0 },
        ],
        ratingAverage: null,
        ratingDistribution: [],
        textAnswers: [],
      };
    }

    return {
      question,
      answered: values.length,
      tallies: [],
      ratingAverage: null,
      ratingDistribution: [],
      textAnswers: uniqueTextAnswers(
        values.filter((value): value is string => typeof value === "string"),
      ),
    };
  });

  const ratingValues = current.flatMap((submission) =>
    ratingQuestions
      .map((question) => submission.answers[question.id])
      .filter((value): value is number => typeof value === "number"),
  );

  return {
    responseCount: current.length,
    configured: true,
    hasRating: ratingQuestions.length > 0,
    ratingAverage:
      ratingValues.length > 0
        ? ratingValues.reduce((sum, value) => sum + value, 0) /
          ratingValues.length
        : null,
    ratingCount: ratingValues.length,
    questions,
  };
}

/** The submissions the analytics surface already holds for the preview idea. */
export function demoSubmissions(
  dataset: AnalyticsDataset,
  form: FeedbackForm | undefined,
): readonly Submission[] {
  return form
    ? dataset.demoSubmissions.filter(
        (submission) => submission.formVersion === form.version,
      )
    : [];
}
