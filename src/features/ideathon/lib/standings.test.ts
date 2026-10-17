import { describe, expect, it } from "vitest";

import {
  categoryBreakdown,
  competitionTotals,
  entryScore,
  rankEntries,
  scoreShare,
  totalSupporters,
} from "@/features/ideathon/lib/standings";
import type { EntrySignals } from "@/features/ideathon/types";

type IdeaOverrides = {
  id: string;
  supporters: number;
  prePledgedAtomic: string;
  category?: string;
  discoveryCategory?: "agriculture" | "technology";
};

function signals(
  supporters: [number, number, number],
  feedback: [number, number, number] = [0, 0, 0],
  prePledge: [number, number, number] = [0, 0, 0],
): EntrySignals {
  return {
    supporters: { EMAIL: supporters[0], SOCIAL: supporters[1], VERIFIED: supporters[2] },
    feedback: { EMAIL: feedback[0], SOCIAL: feedback[1], VERIFIED: feedback[2] },
    prePledge: { EMAIL: prePledge[0], SOCIAL: prePledge[1], VERIFIED: prePledge[2] },
  };
}

function idea({
  id,
  supporters,
  prePledgedAtomic,
  category = "Agriculture",
  discoveryCategory = "agriculture",
}: IdeaOverrides) {
  return {
    id,
    title: id,
    description: "",
    category,
    creator: "Creator",
    creatorInitials: "C",
    artwork: "food" as const,
    discoveryCategory,
    prePledged: { atomic: prePledgedAtomic, currency: "USD" as const, decimals: 2 as const },
    supporters,
    validationPercent: 50,
    feedbackResponses: 0,
    location: "Lagos, Nigeria",
    publishedOrder: 1,
    region: "nigeria" as const,
    visibility: "public" as const,
  };
}

describe("entryScore", () => {
  it("weights each account's flat points by verification tier", () => {
    const score = entryScore(signals([2, 2, 2]));

    expect(score).toBe(2 * 0.25 + 2 * 0.7 + 2 * 1);
  });

  it("counts support, feedback and pre-pledge once each", () => {
    const score = entryScore(signals([1, 0, 0], [1, 0, 0], [1, 0, 0]));

    expect(score).toBe(0.75);
  });

  it("ignores the pre-pledge amount because only tier counts are inputs", () => {
    const score = entryScore(signals([1, 1, 1]));

    expect(score).toBe(0.25 + 0.7 + 1);
  });
});

describe("totalSupporters", () => {
  it("sums every tier", () => {
    expect(totalSupporters(signals([3, 4, 5]).supporters)).toBe(12);
  });
});

describe("rankEntries", () => {
  it("ranks by weighted score before raw supporter count", () => {
    const ranked = rankEntries([
      {
        idea: idea({ id: "many-email", supporters: 10, prePledgedAtomic: "0" }),
        signals: signals([10, 0, 0]),
        score: entryScore(signals([10, 0, 0])),
      },
      {
        idea: idea({ id: "few-verified", supporters: 4, prePledgedAtomic: "0" }),
        signals: signals([0, 0, 4]),
        score: entryScore(signals([0, 0, 4])),
      },
    ]);

    expect(ranked.map((entry) => entry.idea.id)).toEqual(["few-verified", "many-email"]);
    expect(ranked.map((entry) => entry.rank)).toEqual([1, 2]);
  });

  it("breaks an exact score tie by supporters, then by id", () => {
    const ranked = rankEntries([
      {
        idea: idea({ id: "b", supporters: 4, prePledgedAtomic: "0" }),
        signals: signals([0, 0, 4]),
        score: 4,
      },
      {
        idea: idea({ id: "a", supporters: 8, prePledgedAtomic: "0" }),
        signals: signals([0, 0, 8]),
        score: 8,
      },
      {
        idea: idea({ id: "c", supporters: 4, prePledgedAtomic: "0" }),
        signals: signals([0, 0, 4]),
        score: 4,
      },
    ]);

    expect(ranked.map((entry) => entry.idea.id)).toEqual(["a", "b", "c"]);
  });
});

describe("competitionTotals", () => {
  it("sums interest with lossless money addition", () => {
    const ranked = rankEntries([
      {
        idea: idea({ id: "one", supporters: 2, prePledgedAtomic: "123456789" }),
        signals: signals([0, 0, 2]),
        score: 2,
      },
      {
        idea: idea({ id: "two", supporters: 3, prePledgedAtomic: "76543211" }),
        signals: signals([0, 0, 3]),
        score: 3,
      },
    ]);

    const totals = competitionTotals(ranked);

    expect(totals.supporters).toBe(5);
    expect(totals.estimatedInterest.atomic).toBe("200000000");
    expect(totals.entries).toBe(2);
  });
});

describe("scoreShare", () => {
  it("returns zero when the leader has no score rather than dividing by zero", () => {
    expect(scoreShare(0, 0)).toBe(0);
  });

  it("caps at one", () => {
    expect(scoreShare(12, 10)).toBe(1);
  });
});

describe("categoryBreakdown", () => {
  it("counts entries per category and orders by count", () => {
    const breakdown = categoryBreakdown(
      rankEntries([
        {
          idea: idea({ id: "one", supporters: 1, prePledgedAtomic: "0" }),
          signals: signals([1, 0, 0]),
          score: 0.25,
        },
        {
          idea: idea({
            id: "two",
            supporters: 1,
            prePledgedAtomic: "0",
            category: "Technology",
            discoveryCategory: "technology",
          }),
          signals: signals([1, 0, 0]),
          score: 0.25,
        },
        {
          idea: idea({ id: "three", supporters: 1, prePledgedAtomic: "0" }),
          signals: signals([1, 0, 0]),
          score: 0.25,
        },
      ]),
    );

    expect(breakdown[0]).toMatchObject({ category: "Agriculture", count: 2 });
    expect(breakdown[1]).toMatchObject({ category: "Technology", count: 1 });
  });
});
