import type {
  CommunityDestination,
  CommunityInvite,
  FeedbackAnswers,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackQuestionType,
} from "@/features/feedback/types";
import { FEEDBACK_QUESTION_META } from "@/features/feedback/types";

export const FEEDBACK_LIMITS = {
  maxQuestions: 40,
  maxOptions: 20,
  maxLabelLength: 200,
  maxDescriptionLength: 400,
  maxHelpLength: 280,
  maxOptionLength: 120,
  maxTextLength: 2000,
  maxAnswerLength: 4000,
} as const;

export type ValidationIssue = { field: string; message: string };

function nonEmpty(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

let fallbackCounter = 0;

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  fallbackCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${fallbackCounter}`;
}

/**
 * Validate a form before it can be saved or published.
 *
 * This is the browser-side mirror of the API rule in `survey-validation.ts`.
 * The server is still the authority: this function exists so a creator sees the
 * exact problem beside the question that caused it, not a generic rejection.
 */
export function validateFeedbackForm(
  form: Pick<FeedbackForm, "enabled" | "questions" | "title">,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (form.enabled) {
    if (!nonEmpty(form.title)) {
      issues.push({ field: "title", message: "Give the form a title." });
    }
    if (form.questions.length === 0) {
      issues.push({
        field: "questions",
        message: "Add at least one question, or turn feedback off.",
      });
    }
  }

  if (form.questions.length > FEEDBACK_LIMITS.maxQuestions) {
    issues.push({
      field: "questions",
      message: `A form can hold at most ${FEEDBACK_LIMITS.maxQuestions} questions.`,
    });
  }

  const seenLabels = new Set<string>();

  for (const question of form.questions) {
    const prefix = `question:${question.id}`;
    if (!nonEmpty(question.label)) {
      issues.push({ field: prefix, message: "Question label is required." });
    } else if (question.label.trim().length > FEEDBACK_LIMITS.maxLabelLength) {
      issues.push({
        field: prefix,
        message: `Keep the label under ${FEEDBACK_LIMITS.maxLabelLength} characters.`,
      });
    }

    const normalized = question.label.trim().toLocaleLowerCase();
    if (normalized && seenLabels.has(normalized)) {
      issues.push({
        field: prefix,
        message: "Another question already uses this label.",
      });
    }
    seenLabels.add(normalized);

    if (
      question.helpText &&
      question.helpText.length > FEEDBACK_LIMITS.maxHelpLength
    ) {
      issues.push({
        field: prefix,
        message: `Help text can be at most ${FEEDBACK_LIMITS.maxHelpLength} characters.`,
      });
    }

    if (FEEDBACK_QUESTION_META[question.type].supportsOptions) {
      const options = question.options ?? [];
      if (options.length < 2) {
        issues.push({
          field: prefix,
          message: "Choice questions need at least two options.",
        });
      }
      if (options.length > FEEDBACK_LIMITS.maxOptions) {
        issues.push({
          field: prefix,
          message: `A question can hold at most ${FEEDBACK_LIMITS.maxOptions} options.`,
        });
      }
      const seenOptions = new Set<string>();
      for (const option of options) {
        const label = option.label.trim();
        if (!label) {
          issues.push({
            field: prefix,
            message: "Every option needs a label.",
          });
          break;
        }
        if (seenOptions.has(label.toLocaleLowerCase())) {
          issues.push({
            field: prefix,
            message: "Options must be unique.",
          });
          break;
        }
        seenOptions.add(label.toLocaleLowerCase());
      }
    }

    if (question.type === "scale") {
      const scale = question.scale;
      if (!scale || scale.min >= scale.max) {
        issues.push({
          field: prefix,
          message: "A scale needs a lower number than its upper number.",
        });
      } else if (scale.max - scale.min > 10) {
        issues.push({
          field: prefix,
          message: "Keep a scale to 10 steps or fewer.",
        });
      }
    }
  }

  return issues;
}

/** Whether a question's answer counts for the idea's overall rating. */
export function isRatingQuestion(question: FeedbackQuestion): boolean {
  return question.type === "rating";
}

export function emptyAnswerFor(type: FeedbackQuestionType) {
  switch (type) {
    case "multi-choice":
      return [] as string[];
    case "boolean":
      return undefined;
    case "rating":
    case "scale":
      return undefined;
    default:
      return "";
  }
}

export function isAnswered(
  value: FeedbackAnswers[string] | undefined,
): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export type AnswerIssues = Record<string, string>;

/**
 * Validate a respondent's answers against a specific form version. Historical
 * submissions are validated against the version they were answered on, never
 * against today's questions.
 */
export function validateFeedbackAnswers(
  form: FeedbackForm,
  answers: FeedbackAnswers,
): AnswerIssues {
  const issues: AnswerIssues = {};

  for (const question of form.questions) {
    const value = answers[question.id];
    const answered = isAnswered(value);

    if (question.required && !answered) {
      issues[question.id] = "This question is required.";
      continue;
    }
    if (!answered) continue;

    switch (question.type) {
      case "rating": {
        if (
          typeof value !== "number" ||
          !Number.isInteger(value) ||
          value < 1 ||
          value > 5
        ) {
          issues[question.id] = "Choose a rating from 1 to 5.";
        }
        break;
      }
      case "scale": {
        const scale = question.scale ?? { min: 1, max: 5 };
        if (
          typeof value !== "number" ||
          !Number.isInteger(value) ||
          value < scale.min ||
          value > scale.max
        ) {
          issues[question.id] =
            `Choose a value from ${scale.min} to ${scale.max}.`;
        }
        break;
      }
      case "boolean": {
        if (typeof value !== "boolean") {
          issues[question.id] = "Choose yes or no.";
        }
        break;
      }
      case "single-choice": {
        const options = (question.options ?? []).map((option) => option.label);
        if (typeof value !== "string" || !options.includes(value)) {
          issues[question.id] = "Choose one of the listed options.";
        }
        break;
      }
      case "multi-choice": {
        const options = (question.options ?? []).map((option) => option.label);
        if (
          !Array.isArray(value) ||
          value.length === 0 ||
          value.some((item) => !options.includes(item))
        ) {
          issues[question.id] = "Choose at least one listed option.";
        }
        break;
      }
      case "short-text":
      case "long-text":
      default: {
        if (typeof value !== "string") {
          issues[question.id] = "Enter a text answer.";
        } else if (value.length > FEEDBACK_LIMITS.maxAnswerLength) {
          issues[question.id] =
            `Keep your answer under ${FEEDBACK_LIMITS.maxAnswerLength} characters.`;
        }
        break;
      }
    }
  }

  return issues;
}

export function answeredCount(
  form: FeedbackForm,
  answers: FeedbackAnswers,
): number {
  return form.questions.filter((question) => isAnswered(answers[question.id]))
    .length;
}

export function newQuestion(type: FeedbackQuestionType): FeedbackQuestion {
  const id = createId("q");
  const base: FeedbackQuestion = {
    id,
    label: "",
    type,
    required: false,
  };

  if (FEEDBACK_QUESTION_META[type].supportsOptions) {
    return {
      ...base,
      options: [
        { id: createId("o"), label: "First option" },
        { id: createId("o"), label: "Second option" },
      ],
    };
  }
  if (type === "scale") {
    return {
      ...base,
      scale: { min: 1, max: 5, minLabel: "Not at all", maxLabel: "Completely" },
    };
  }
  return base;
}

export function duplicateQuestion(
  question: FeedbackQuestion,
): FeedbackQuestion {
  return {
    ...question,
    id: createId("q"),
    label: question.label ? `${question.label} (copy)` : "",
    options: question.options?.map((option) => ({
      ...option,
      id: createId("o"),
    })),
    scale: question.scale ? { ...question.scale } : undefined,
  };
}
export function moveItem<T>(
  items: readonly T[],
  from: number,
  to: number,
): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return next;
  next.splice(to, 0, moved);
  return next;
}

export type ApprovedUrl = { url: string } | { error: string };

const HTTPS_PROTOCOLS = ["https:"];

/**
 * Only HTTPS links leave the product. A relative `/creators/...` profile link is
 * allowed because it stays inside Inverge. `javascript:`, `data:`, and plain
 * HTTP are rejected rather than rewritten.
 */
export function validateCommunityUrl(raw: string): ApprovedUrl {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Enter a link." };

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return { url: trimmed };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { error: "Enter a full link starting with https://" };
  }

  if (!HTTPS_PROTOCOLS.includes(parsed.protocol)) {
    return { error: "Only https:// links are accepted." };
  }
  if (!parsed.hostname.includes(".")) {
    return { error: "That link is missing a valid domain." };
  }
  return { url: parsed.toString() };
}

export function enabledDestinations(
  invite: CommunityInvite,
): CommunityDestination[] {
  if (!invite.enabled) return [];
  return invite.destinations.filter((destination) => {
    if (!destination.enabled) return false;
    return "url" in validateCommunityUrl(destination.url);
  });
}

export function primaryDestination(
  invite: CommunityInvite,
): CommunityDestination | undefined {
  const destinations = enabledDestinations(invite);
  return (
    destinations.find(
      (destination) => destination.id === invite.primaryDestinationId,
    ) ?? destinations[0]
  );
}

/**
 * The average overall rating from a set of submissions. Only answers to
 * questions explicitly configured as `rating` contribute; a choice or scale
 * answer is never silently folded into this figure.
 */
export function overallRating(
  form: FeedbackForm,
  answers: readonly FeedbackAnswers[],
): { average: number; count: number } {
  const ratingIds = new Set(
    form.questions
      .filter((question) => isRatingQuestion(question))
      .map((question) => question.id),
  );
  const values: number[] = [];

  for (const submission of answers) {
    for (const questionId of ratingIds) {
      const value = submission[questionId];
      if (typeof value === "number" && value >= 1 && value <= 5) {
        values.push(value);
      }
    }
  }

  if (values.length === 0) return { average: 0, count: 0 };
  return {
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
    count: values.length,
  };
}
