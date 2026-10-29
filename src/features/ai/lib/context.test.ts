import { describe, expect, it } from "vitest";

import { assistantContext } from "@/features/ai/lib/context";
import { emptyIdeaDraft, type IdeaDraft } from "@/features/idea-builder/types";

function draft(overrides: Partial<IdeaDraft> = {}): IdeaDraft {
  return {
    ...emptyIdeaDraft,
    title: "Solar kiosks",
    summary: "Shared charging for market traders.",
    problem: "Grid outages close shops early.",
    targetUser: "Market traders in Onitsha",
    currentAlternative: "Diesel generators.",
    solution: "A shared charging kiosk per market.",
    risks: "   ",
    ...overrides,
  };
}

describe("assistantContext", () => {
  it("drops the target field and blank context", () => {
    const context = assistantContext(draft(), "solution");

    expect(context.solution).toBeUndefined();
    expect(context.risks).toBeUndefined();
    expect(context.problem).toContain("Grid outages");
  });

  it("trims the context it keeps", () => {
    const context = assistantContext(
      draft({ title: "  Solar kiosks  " }),
      "problem",
    );

    expect(context.title).toBe("Solar kiosks");
  });
});
