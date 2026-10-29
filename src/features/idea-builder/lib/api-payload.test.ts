import { describe, expect, it } from "vitest";

import {
  toIdeaApiPayload,
  toSurveyApiPayload,
} from "@/features/idea-builder/lib/api-payload";
import { emptyIdeaDraft } from "@/features/idea-builder/types";

describe("toIdeaApiPayload", () => {
  it("maps the builder categories onto the API's legacy buckets", () => {
    expect(
      toIdeaApiPayload({ ...emptyIdeaDraft, category: "food-retail" }).category,
    ).toBe("food");
    expect(
      toIdeaApiPayload({ ...emptyIdeaDraft, category: "clean-energy" }).category,
    ).toBe("cleantech");
  });

  it("keeps unsupported preview fields out of the API body", () => {
    const payload = toIdeaApiPayload({
      ...emptyIdeaDraft,
      title: "Idea",
      summary: "Not stored yet",
      community: {
        ...emptyIdeaDraft.community,
        enabled: true,
        title: "Community",
      },
    });

    expect(payload).not.toHaveProperty("summary");
    expect(payload).not.toHaveProperty("community");
  });

  it("maps funding and roadmap only when they are present", () => {
    const payload = toIdeaApiPayload({
      ...emptyIdeaDraft,
      goals: { ...emptyIdeaDraft.goals, funding: true },
      funding: {
        askAmount: "15000",
        useOfFunds: [
          { amount: "1000", id: "one", label: "Equipment" },
          { amount: "", id: "two", label: "Ignored" },
        ],
      },
      roadmapSteps: [
        { date: "Nov 2026", description: "Pilot", id: "step" },
        { date: "", description: "Ignored", id: "empty" },
      ],
    });

    expect(payload.askAmount).toBe(15000);
    expect(payload.askBreakdown).toEqual({ Equipment: 1000 });
    expect(payload.roadmapSteps).toEqual([
      { date: "Nov 2026", description: "Pilot" },
    ]);
  });
});

describe("toSurveyApiPayload", () => {
  it("maps builder question types and options to the survey contract", () => {
    const payload = toSurveyApiPayload({
      ...emptyIdeaDraft.feedback,
      questions: [
        {
          id: "rating",
          label: "How promising?",
          required: true,
          type: "rating",
        },
        {
          id: "choice",
          label: "Pick one",
          options: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
          ],
          required: false,
          type: "single-choice",
        },
      ],
    });

    expect(payload.questions).toEqual([
      {
        index: 0,
        prompt: "How promising?",
        required: true,
        type: "RATING",
      },
      {
        index: 1,
        options: ["A", "B"],
        prompt: "Pick one",
        required: false,
        type: "SINGLE_CHOICE",
      },
    ]);
  });
});
