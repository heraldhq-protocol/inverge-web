import { describe, expect, it } from "vitest";

import {
  buildCreatorIdeaRows,
  ideaStatusLabel,
  ideaVisibilityLabel,
} from "@/features/ideas/lib/creator-rows";
import {
  computeCreatorMetrics,
  recommendCreatorActions,
} from "@/features/ideas/lib/studio-metrics";
import type { MyIdea } from "@/features/ideas/types";

function myIdea(id: string, overrides: Partial<MyIdea> = {}): MyIdea {
  return {
    artwork: "community",
    category: "Community",
    cover: null,
    discoveryCategory: "community",
    id,
    prePledged: { atomic: "1000", currency: "USD", decimals: 2 },
    status: "validating",
    supporters: 10,
    title: id,
    updatedAt: "2026-10-01T10:00:00.000Z",
    validationPercent: 40,
    visibility: "private",
    ...overrides,
  };
}

describe("computeCreatorMetrics", () => {
  it("sums support and intent without floating point", () => {
    const metrics = computeCreatorMetrics(
      [
        myIdea("a", {
          prePledged: { atomic: "100000000", currency: "USD", decimals: 2 },
          supporters: 120,
        }),
        myIdea("b", {
          prePledged: { atomic: "50000000", currency: "USD", decimals: 2 },
          supporters: 80,
        }),
      ],
      {},
    );

    expect(metrics.prePledgedIntent.atomic).toBe("150000000");
    expect(metrics.totalSupporters).toBe(200);
  });

  it("counts published and draft ideas independently of status", () => {
    const metrics = computeCreatorMetrics(
      [
        myIdea("public", { status: "validating", visibility: "public" }),
        myIdea("draft", { status: "draft", visibility: "private" }),
      ],
      {},
    );

    expect(metrics.publishedIdeas).toBe(1);
    expect(metrics.draftIdeas).toBe(1);
  });

  it("counts feedback only for ideas that have it", () => {
    const metrics = computeCreatorMetrics([myIdea("a"), myIdea("b")], { a: 3 });

    expect(metrics.feedbackReceived).toBe(3);
  });

  it("returns zeroed money rather than undefined for an empty studio", () => {
    expect(computeCreatorMetrics([], {})).toEqual({
      draftIdeas: 0,
      feedbackReceived: 0,
      prePledgedIntent: { atomic: "0", currency: "USD", decimals: 2 },
      publishedIdeas: 0,
      totalSupporters: 0,
    });
  });
});

describe("recommendCreatorActions", () => {
  it("raises a draft before anything else", () => {
    const steps = recommendCreatorActions([
      myIdea("draft", { status: "draft" }),
    ]);

    expect(steps[0]?.title).toBe("Finish a draft");
  });

  it("says nothing when there is nothing to act on", () => {
    expect(
      recommendCreatorActions([
        myIdea("published", { status: "validating", visibility: "public" }),
      ]),
    ).toEqual([]);
  });
});

describe("buildCreatorIdeaRows", () => {
  const options = {
    analyticsIdeaIds: ["with-analytics"],
    feedbackCounts: { "with-detail": 4 },
    hasDetail: (id: string) => id === "with-detail",
  };

  it("links only to destinations that exist", () => {
    const [row] = buildCreatorIdeaRows([myIdea("with-detail")], options);

    expect(row).toMatchObject({
      analyticsHref: null,
      detailHref: "/ideas/with-detail",
      feedbackHref: "/d/creator/ideas/with-detail/feedback",
      feedbackResponses: 4,
    });
  });

  it("leaves an unresolvable draft unlinked", () => {
    const [row] = buildCreatorIdeaRows(
      [myIdea("private-draft", { status: "draft" })],
      options,
    );

    expect(row).toMatchObject({
      analyticsHref: null,
      detailHref: null,
      feedbackHref: null,
    });
  });

  it("links analytics only for ideas with a dataset", () => {
    const [row] = buildCreatorIdeaRows([myIdea("with-analytics")], options);

    expect(row?.analyticsHref).toBe("/d/creator/ideas/with-analytics/insights");
  });
});

describe("labels", () => {
  it("keeps status and visibility separate", () => {
    expect(ideaStatusLabel["threshold-met"]).toBe("Threshold met");
    expect(ideaVisibilityLabel(myIdea("a"))).toBe("Unlisted");
    expect(ideaVisibilityLabel(myIdea("b", { status: "draft" }))).toBe(
      "Unpublished",
    );
    expect(ideaVisibilityLabel(myIdea("c", { visibility: "public" }))).toBe(
      "Listed in discovery",
    );
  });
});
