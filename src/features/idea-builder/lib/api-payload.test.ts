import { describe, expect, it } from "vitest";

import {
  assistantContext,
  missingIdeaApiFields,
  toIdeaApiPayload,
} from "@/features/idea-builder/lib/api-payload";
import { emptyIdeaDraft, type IdeaDraft } from "@/features/idea-builder/types";

function draft(overrides: Partial<IdeaDraft> = {}): IdeaDraft {
  return {
    ...emptyIdeaDraft,
    title: "  Solar kiosks  ",
    problem: "  Grid outages close shops early.  ",
    solution: "  A shared charging kiosk per market.  ",
    targetUser: "  Market traders in Onitsha  ",
    currentAlternative: "  Diesel generators.  ",
    category: "clean-energy",
    region: " Nigeria ",
    coverUrl: " https://images.example.com/kiosk.jpg ",
    risks: "  Theft of panels.  ",
    ...overrides,
  };
}

describe("toIdeaApiPayload", () => {
  it("maps the builder category to the API category and trims text", () => {
    // #given a clean-energy draft with padded text
    const payload = toIdeaApiPayload(draft());

    // #then the bucket is translated and the text is clean
    expect(payload.category).toBe("cleantech");
    expect(payload.title).toBe("Solar kiosks");
    expect(payload.problem).toBe("Grid outages close shops early.");
    expect(payload.region).toBe("Nigeria");
  });

  it("sends zero funding for a feedback-only idea", () => {
    // #given no ask and no use of funds
    const payload = toIdeaApiPayload(draft());

    // #then funding fields are explicit, so an update clears older values
    expect(payload.askAmount).toBe(0);
    expect(payload.askBreakdown).toEqual({});
    expect(payload.roadmapSteps).toEqual([]);
  });

  it("keeps only complete roadmap steps and merges duplicate fund labels", () => {
    // #given one complete step, one partial step and duplicate labels
    const payload = toIdeaApiPayload(
      draft({
        roadmapSteps: [
          { id: "1", date: "2026-12-01", description: "  Pilot  " },
          { id: "2", date: "2027-01-01", description: "   " },
        ],
        funding: {
          askAmount: "25,000",
          useOfFunds: [
            { id: "a", label: "Hardware", amount: "10000" },
            { id: "b", label: "Hardware", amount: "5000" },
            { id: "c", label: "  ", amount: "900" },
            { id: "d", label: "Team", amount: "0" },
          ],
        },
      }),
    );

    // #then only the complete step ships and duplicate labels add up
    expect(payload.roadmapSteps).toEqual([
      { date: "2026-12-01", description: "Pilot" },
    ]);
    expect(payload.askAmount).toBe(25_000);
    expect(payload.askBreakdown).toEqual({ Hardware: 15_000 });
  });

  it("sends null for cleared optional fields", () => {
    // #given a draft with the optional fields emptied
    const payload = toIdeaApiPayload(
      draft({ region: " ", coverUrl: "", risks: "  " }),
    );

    // #then an update can clear them instead of keeping stale text
    expect(payload.region).toBeNull();
    expect(payload.coverImageUrl).toBeNull();
    expect(payload.risks).toBeNull();
  });

  it("omits an empty category rather than inventing one", () => {
    // #given a draft with no category
    const payload = toIdeaApiPayload(draft({ category: "" }));

    // #then the payload has no category value
    expect(payload.category).toBeUndefined();
  });
});

describe("missingIdeaApiFields", () => {
  it("lists what the API still needs, in step order", () => {
    // #given a draft missing a title and category
    const payload = toIdeaApiPayload(draft({ title: "  ", category: "" }));

    // #then the missing labels are returned
    expect(missingIdeaApiFields(payload)).toEqual(["a title", "a category"]);
  });

  it("returns nothing when the required fields are present", () => {
    expect(missingIdeaApiFields(toIdeaApiPayload(draft()))).toEqual([]);
  });
});

describe("assistantContext", () => {
  it("drops the target field and blank context", () => {
    // #given a draft with a target and an empty risk field
    const context = assistantContext(draft({ risks: "   " }), "solution");

    // #then the target is not duplicated and blank values are omitted
    expect(context.solution).toBeUndefined();
    expect(context.risks).toBeUndefined();
    expect(context.problem).toContain("Grid outages");
  });
});
