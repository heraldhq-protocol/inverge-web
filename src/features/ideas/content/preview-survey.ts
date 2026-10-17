import type { SurveyQuestion } from "@/features/ideas/types";

/**
 * The survey a public idea page shows.
 *
 * The questions measure behaviour rather than opinion: a promise rating (which
 * drives `feedbackScore`), the concrete reasons someone might not back the
 * idea, and an open prompt. The API lets a creator replace these, so the reader
 * renders whatever it is handed rather than assuming a fixed set — this fixture
 * is one instance of that shape.
 */
export const previewSurveyQuestions: SurveyQuestion[] = [
  {
    id: "promise",
    kind: "rating",
    options: [],
    prompt: "Overall, how promising is this idea?",
    required: true,
  },
  {
    id: "blockers",
    kind: "multi-choice",
    options: [
      "Problem unclear",
      "Ask too high",
      "Trust concern",
      "Already solved elsewhere",
    ],
    prompt: "What would stop you backing this?",
    required: false,
  },
  {
    id: "strengthen",
    kind: "free-text",
    options: [],
    prompt: "What should the creator know?",
    required: false,
  },
];
