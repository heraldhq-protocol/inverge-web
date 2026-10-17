import { describe, expect, it } from "vitest";

import { describeSubmissionAnswers } from "@/features/feedback/lib/submissions";
import type { FeedbackQuestion } from "@/features/feedback/types";

const choice = (
  id: string,
  options: { id: string; label: string }[],
): FeedbackQuestion => ({
  id,
  label: `How do you feel about ${id}?`,
  options,
  required: false,
  type: "single-choice",
});

const notes: FeedbackQuestion = {
  id: "notes",
  label: "Anything else?",
  required: false,
  type: "long-text",
};

const promise: FeedbackQuestion = {
  id: "promise",
  label: "How promising is this?",
  required: false,
  type: "rating",
};

describe("describeSubmissionAnswers", () => {
  it("resolves option ids back to the labels the respondent saw", () => {
    const described = describeSubmissionAnswers(
      [
        choice("interest", [
          { id: "learn", label: "I would like to learn more" },
          { id: "teach", label: "I could teach" },
        ]),
      ],
      { interest: "teach" },
    );

    expect(described).toEqual([
      {
        answer: "I could teach",
        question: "How do you feel about interest?",
      },
    ]);
  });

  it("joins a multi-choice answer with its option labels", () => {
    const question: FeedbackQuestion = {
      ...choice("blockers", [
        { id: "time", label: "Time" },
        { id: "safety", label: "Safety" },
      ]),
      type: "multi-choice",
    };

    const described = describeSubmissionAnswers([question], {
      blockers: ["safety", "time"],
    });

    expect(described[0]?.answer).toBe("Safety, Time");
  });

  it("renders a rating as a share of the fixed five-point scale", () => {
    const described = describeSubmissionAnswers([promise], { promise: 4 });

    expect(described[0]?.answer).toBe("4 of 5");
  });

  it("keeps a free-text answer verbatim when its question has no options", () => {
    const described = describeSubmissionAnswers([notes], {
      notes: "  Evenings after 6pm would work for me. ",
    });

    expect(described[0]?.answer).toBe("Evenings after 6pm would work for me.");
  });

  it("renders a boolean answer as Yes or No", () => {
    const trust: FeedbackQuestion = {
      id: "trust",
      label: "Would you trust this?",
      required: false,
      type: "boolean",
    };

    expect(describeSubmissionAnswers([trust], { trust: true })[0]?.answer).toBe(
      "Yes",
    );
    expect(
      describeSubmissionAnswers([trust], { trust: false })[0]?.answer,
    ).toBe("No");
  });

  it("skips questions the respondent left blank", () => {
    const described = describeSubmissionAnswers([notes, promise], {
      promise: 5,
    });

    expect(described).toHaveLength(1);
    expect(described[0]?.question).toBe("How promising is this?");
  });

  it("drops answers whose question the form version no longer declares", () => {
    const described = describeSubmissionAnswers([notes], {
      retired: "raw id with no question",
      notes: "Still relevant.",
    });

    expect(described).toHaveLength(1);
    expect(described[0]?.answer).toBe("Still relevant.");
  });
});
