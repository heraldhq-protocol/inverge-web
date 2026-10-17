import { describe, expect, it } from "vitest";

import { summariseFeedback } from "@/features/analytics/lib/feedback-summary";
import type { FeedbackAnswers, FeedbackForm } from "@/features/feedback/types";

const form: FeedbackForm = {
  description: "",
  enabled: true,
  published: true,
  title: "Feedback",
  updatedAt: "2026-10-16T09:00:00.000Z",
  version: 3,
  questions: [
    { id: "rating", label: "How promising?", required: true, type: "rating" },
    {
      id: "interest",
      label: "Your interest",
      required: false,
      type: "single-choice",
      options: [
        { id: "a", label: "Teach" },
        { id: "b", label: "Learn" },
      ],
    },
    {
      id: "blockers",
      label: "Concerns",
      required: false,
      type: "multi-choice",
      options: [
        { id: "c", label: "Time" },
        { id: "d", label: "Safety" },
      ],
    },
    { id: "note", label: "Anything else?", required: false, type: "long-text" },
  ],
};

const submissions: readonly { answers: FeedbackAnswers; formVersion: number }[] = [
  {
    formVersion: 3,
    answers: {
      rating: 5,
      interest: "Learn",
      blockers: ["Time", "Safety"],
      note: "Evenings would work.",
    },
  },
  {
    formVersion: 3,
    answers: {
      rating: 3,
      interest: "Learn",
      blockers: ["Time"],
      note: "Evenings would work.",
    },
  },
  {
    // Belongs to an older form version and must not be reinterpreted.
    formVersion: 2,
    answers: { rating: 1, interest: "Teach", blockers: [], note: "Old answer" },
  },
];

describe("summariseFeedback", () => {
  it("counts only submissions for the current form version", () => {
    const summary = summariseFeedback(form, submissions);

    expect(summary.responseCount).toBe(2);
    expect(summary.ratingCount).toBe(2);
    expect(summary.ratingAverage).toBe(4);
  });

  it("builds choice tallies without folding them into the rating", () => {
    const summary = summariseFeedback(form, submissions);
    const interest = summary.questions.find(
      (question) => question.question.id === "interest",
    );

    expect(interest?.tallies).toEqual([
      { label: "Teach", count: 0, share: 0 },
      { label: "Learn", count: 2, share: 1 },
    ]);
    expect(summary.ratingAverage).toBe(4);
  });

  it("deduplicates repeated written answers for display", () => {
    const summary = summariseFeedback(form, submissions);
    const notes = summary.questions.find(
      (question) => question.question.id === "note",
    );

    expect(notes?.textAnswers).toEqual(["Evenings would work."]);
  });

  it("returns no rating when the form has no rating question", () => {
    const summary = summariseFeedback(
      {
        ...form,
        questions: [
          {
            id: "interest",
            label: "Your interest",
            required: false,
            type: "single-choice",
            options: [
              { id: "a", label: "Teach" },
              { id: "b", label: "Learn" },
            ],
          },
        ],
      },
      submissions,
    );

    expect(summary.hasRating).toBe(false);
    expect(summary.ratingAverage).toBeNull();
  });

  it("returns an empty summary for a disabled form", () => {
    expect(
      summariseFeedback({ ...form, enabled: false }, submissions),
    ).toMatchObject({ configured: false, responseCount: 0 });
  });
});
