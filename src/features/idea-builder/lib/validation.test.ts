import { describe, expect, it } from "vitest";

import {
  draftCompleteness,
  validateDraft,
  validateDraftStep,
} from "@/features/idea-builder/lib/validation";
import { emptyIdeaDraft, type IdeaDraft } from "@/features/idea-builder/types";

function draft(overrides: Partial<IdeaDraft> = {}): IdeaDraft {
  return {
    ...emptyIdeaDraft,
    title: "CampusKonekt",
    summary: "A verified directory of campus businesses.",
    category: "technology",
    problem: "Students cannot find nearby businesses.",
    targetUser: "Students and campus vendors.",
    currentAlternative: "Word of mouth.",
    solution: "A verified directory and ordering layer.",
    roadmapSteps: [
      { id: "one", date: "2026-11-30", description: "Onboard 200 vendors." },
      { id: "two", date: "2026-12-31", description: "Launch ordering." },
    ],
    goals: { community: false, feedback: true, funding: false },
    ...overrides,
  };
}

describe("validateDraftStep", () => {
  it("requires the basics before step one can continue", () => {
    const issues = validateDraftStep(
      { ...draft(), title: "", summary: "" },
      "basics",
    );

    expect(issues.map((issue) => issue.field)).toEqual(["title", "summary"]);
  });

  it("does not require a funding amount when the goal is off", () => {
    expect(
      validateDraftStep(
        draft({ funding: { askAmount: "", useOfFunds: [] } }),
        "goals",
      ),
    ).toEqual([]);
  });

  it("requires an indicative amount once funding is selected", () => {
    const issues = validateDraftStep(
      draft({
        goals: { community: false, feedback: true, funding: true },
        funding: { askAmount: "", useOfFunds: [] },
      }),
      "goals",
    );

    expect(issues.map((issue) => issue.field)).toContain("funding.askAmount");
  });

  it("requires at least one goal", () => {
    const issues = validateDraftStep(
      draft({ goals: { community: false, feedback: false, funding: false } }),
      "goals",
    );

    expect(issues.map((issue) => issue.field)).toContain("goals");
  });

  it("validates configured feedback questions only for an enabled form", () => {
    const off = draft({
      feedback: { ...emptyIdeaDraft.feedback, enabled: false, questions: [] },
    });
    expect(validateDraftStep(off, "feedback")).toEqual([]);

    const on = draft({
      feedback: { ...emptyIdeaDraft.feedback, enabled: true, questions: [] },
    });
    expect(
      validateDraftStep(on, "feedback").some((issue) =>
        issue.message.includes("at least one question"),
      ),
    ).toBe(true);
  });

  it("requires a valid community link when the invitation is on", () => {
    const issues = validateDraftStep(
      draft({
        goals: { community: true, feedback: false, funding: false },
        community: {
          ...emptyIdeaDraft.community,
          enabled: true,
          destinations: [
            {
              enabled: true,
              id: "bad",
              kind: "website",
              label: "Bad",
              url: "javascript:alert(1)",
            },
          ],
        },
      }),
      "feedback",
    );

    expect(issues.some((issue) => issue.message.includes("Only https"))).toBe(
      true,
    );
  });

  it("treats the roadmap as optional but validates a started step", () => {
    // #given no roadmap at all
    expect(validateDraftStep(draft({ roadmapSteps: [] }), "roadmap")).toEqual(
      [],
    );

    // #when a step is started with only a description
    const issues = validateDraftStep(
      draft({
        roadmapSteps: [{ id: "one", date: "", description: "Launch a pilot." }],
      }),
      "roadmap",
    );

    // #then the missing half is reported on that step
    expect(issues.map((issue) => issue.field)).toContain("roadmap:one");
  });
});

describe("validateDraft", () => {
  it("passes a complete validation-only idea with no funding fields", () => {
    expect(validateDraft(draft())).toEqual([]);
  });

  it("reports every incomplete section at once", () => {
    const issues = validateDraft(emptyIdeaDraft);
    expect(issues.length).toBeGreaterThan(3);
  });
});

describe("draftCompleteness", () => {
  it("counts only genuine essentials", () => {
    const incomplete = draftCompleteness(emptyIdeaDraft);
    const complete = draftCompleteness(draft());

    expect(incomplete.percent).toBeLessThan(50);
    expect(complete.percent).toBe(100);
  });
});
