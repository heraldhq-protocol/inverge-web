import { describe, expect, it } from "vitest";

import {
  draftFromIdea,
  toConvertIdeaPayload,
} from "@/features/campaigns/lib/idea-conversion";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";

function previewIdea() {
  const idea = getPreviewIdeaDetail("campus-konekt");
  if (!idea) throw new Error("Missing preview idea fixture");
  return idea;
}

function plan(overrides: Record<string, unknown> = {}) {
  return {
    deadline: "2027-06-30",
    milestones: [
      {
        allocationPercent: "50",
        deliverable: "Verify the first cohort of vendors.",
        evidence: "A signed vendor list and a public directory page.",
        title: "Verify vendors",
      },
      {
        allocationPercent: "50",
        deliverable: "Ship student ordering and payment.",
        evidence: "A live checkout and a reconciliation report.",
        title: "Ship ordering",
      },
    ],
    targetAmount: "30000",
    tokenType: "USDC",
    workingCapitalPercent: "20",
    ...overrides,
  };
}

describe("draftFromIdea", () => {
  it("carries the pitch, ask, breakdown and roadmap into the wizard", () => {
    const idea = previewIdea();
    const draft = draftFromIdea(idea);

    expect(draft.title).toBe(idea.title);
    expect(draft.problem).toBe(idea.problem);
    expect(draft.solution).toBe(idea.solution);
    expect(draft.targetInput).toBe("30000");
    expect(draft.useOfFunds).toHaveLength(3);
    expect(draft.milestones).toHaveLength(3);
    expect(
      draft.milestones.map((milestone) => milestone.allocationPercent),
    ).toEqual(["33.33", "33.33", "33.34"]);
    // Conversion is one-way, so the creator finishes the evidence themselves.
    expect(
      draft.milestones.every((milestone) => milestone.evidence === ""),
    ).toBe(true);
  });
});

describe("toConvertIdeaPayload", () => {
  it("maps a complete plan to the API's conversion shape", () => {
    const result = toConvertIdeaPayload(plan());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.type).toBe("ALL_OR_NOTHING");
    expect(result.payload.workingCapitalPct).toBe(20);
    expect(result.payload.deadline).toBe("2027-06-30T00:00:00.000Z");
    expect(result.payload.milestones[0]?.evidenceDefinition).toEqual({
      text: "A signed vendor list and a public directory page.",
    });
  });

  it("refuses tranches that do not total 100", () => {
    const result = toConvertIdeaPayload(
      plan({
        milestones: [
          {
            allocationPercent: "40",
            deliverable: "One",
            evidence: "Evidence one",
            title: "One",
          },
          {
            allocationPercent: "40",
            deliverable: "Two",
            evidence: "Evidence two",
            title: "Two",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
  });

  it("refuses a plan without a deadline", () => {
    expect(toConvertIdeaPayload(plan({ deadline: "" })).ok).toBe(false);
  });

  it("refuses a plan without milestone evidence", () => {
    const result = toConvertIdeaPayload(
      plan({
        milestones: [
          {
            allocationPercent: "50",
            deliverable: "One",
            evidence: "",
            title: "One",
          },
          {
            allocationPercent: "50",
            deliverable: "Two",
            evidence: "Evidence two",
            title: "Two",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
  });
});
