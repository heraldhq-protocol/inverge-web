import type {
  FeedbackAnswers,
  FeedbackOption,
  FeedbackQuestion,
} from "@/features/feedback/types";

/**
 * One question/answer pair, rendered for a reader rather than a form.
 *
 * A submission records question ids and option ids, which mean nothing to a
 * creator reading their feedback. This resolves both back to the labels the
 * respondent actually saw.
 */
export type DescribedAnswer = {
  question: string;
  answer: string;
};

/**
 * The rating type is fixed at 1 to 5; the choice scale carries its own max.
 * Mirrored here because the fixture question type owns the rule, not the
 * renderer.
 */
const RATING_MAX = 5;

function optionLabel(
  options: readonly FeedbackOption[] | undefined,
  id: string,
): string {
  return options?.find((option) => option.id === id)?.label ?? id;
}

function describeValue(
  question: FeedbackQuestion | undefined,
  value: FeedbackAnswers[string] | undefined,
): string | null {
  if (value === undefined) return null;

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value
      .map((id) => (question ? optionLabel(question.options, id) : id))
      .join(", ");
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") {
    const max =
      question?.type === "scale"
        ? (question.scale?.max ?? null)
        : question?.type === "rating"
          ? RATING_MAX
          : null;
    return max === null ? String(value) : `${value} of ${max}`;
  }

  const text = value.trim();
  if (text === "") return null;
  return question ? optionLabel(question.options, text) : text;
}

/**
 * Resolve a submission's answers against the questions of the form version it
 * answered.
 *
 * Answers follow the form's question order, so a response reads the way it was
 * written. Answers to question ids the form does not declare are dropped:
 * their wording no longer exists, and showing a raw id would misrepresent the
 * question the respondent actually saw.
 */
export function describeSubmissionAnswers(
  questions: readonly FeedbackQuestion[],
  answers: FeedbackAnswers,
): DescribedAnswer[] {
  const described: DescribedAnswer[] = [];

  for (const question of questions) {
    const answer = describeValue(question, answers[question.id]);
    if (answer !== null) described.push({ answer, question: question.label });
  }

  return described;
}
