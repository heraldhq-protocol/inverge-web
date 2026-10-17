import { describe, expect, it } from "vitest";

import { previewIdeaDetails } from "@/features/ideas/content/preview-details";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";

/**
 * The public idea page composes a summary with its detail record, so every
 * public idea must carry one. This guards the fixture against drift: a new
 * public idea without a pitch turns its page into a 404 at build time rather
 * than at review.
 */
describe("previewIdeaDetails", () => {
  it("has a pitch record for every public idea", () => {
    // given the public catalogue
    const publicIds = allPublicIdeas(ideasPreviewData).map(({ id }) => id);

    // when
    const missing = publicIds.filter((id) => !(id in previewIdeaDetails));

    // then
    expect(missing).toEqual([]);
  });

  it("gives every pitch a non-empty problem and solution", () => {
    // given every detail record

    // when
    const empty = Object.entries(previewIdeaDetails)
      .filter(
        ([, detail]) =>
          detail.problem.length === 0 || detail.solution.length === 0,
      )
      .map(([id]) => id);

    // then
    expect(empty).toEqual([]);
  });

  it("gives every pitch at least two dated roadmap steps and a matching ask", () => {
    // given every detail record

    // when
    const broken = Object.entries(previewIdeaDetails)
      .filter(
        ([, detail]) =>
          detail.roadmapSteps.length < 2 ||
          detail.askBreakdown.reduce(
            (total, item) => total + BigInt(item.amount.atomic),
            0n,
          ) !== BigInt(detail.askAmount.atomic),
      )
      .map(([id]) => id);

    // then — the ask breakdown must sum to the stated ask, exactly.
    expect(broken).toEqual([]);
  });
});
