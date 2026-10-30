import type { FeedbackAnswers, FeedbackAnswerValue } from "@/features/feedback/types";

/**
 * Convert stored survey answers (`[{ questionId, value }]`) to the form-shaped
 * record the readers use.
 *
 * Values outside the supported scalar/list shapes are dropped rather than
 * coerced: a malformed answer should disappear, not render as "[object Object]".
 */
export function toFeedbackAnswers(value: unknown): FeedbackAnswers {
  if (!Array.isArray(value)) return {};

  const answers: FeedbackAnswers = {};
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.questionId !== "string" || !record.questionId.trim()) {
      continue;
    }

    const answer = record.value;
    if (
      typeof answer === "string" ||
      typeof answer === "number" ||
      typeof answer === "boolean" ||
      (Array.isArray(answer) &&
        answer.every((item): item is string => typeof item === "string"))
    ) {
      answers[record.questionId] = answer as FeedbackAnswerValue;
    }
  }
  return answers;
}
