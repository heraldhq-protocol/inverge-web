import { describe, expect, it } from "vitest";

import {
  bestFeedbackOpportunity,
  rankIdeasForFeed,
} from "@/features/home/lib/feed";
import type { DiscoveryIdea } from "@/features/ideas/types";

function idea(
  id: string,
  overrides: Partial<DiscoveryIdea> = {},
): DiscoveryIdea {
  return {
    artwork: "campus",
    category: "Technology",
    creator: "A Creator",
    creatorInitials: "AC",
    description: "A description",
    discoveryCategory: "technology",
    feedbackResponses: 0,
    id,
    location: "Lagos, Nigeria",
    prePledged: { atomic: "0", currency: "USD", decimals: 2 },
    publishedOrder: 1,
    region: "nigeria",
    supporters: 10,
    title: id,
    validationPercent: 40,
    visibility: "public",
    ...overrides,
  };
}

describe("rankIdeasForFeed", () => {
  it("orders by supporters, then validation, then title", () => {
    const feed = rankIdeasForFeed(
      [
        idea("c", { supporters: 50, title: "C" }),
        idea("a", { supporters: 90, title: "A" }),
        idea("b", { supporters: 50, validationPercent: 70, title: "B" }),
      ],
      { limit: 3 },
    );

    expect(feed.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
  });

  it("never leaks a private idea into a feed", () => {
    const feed = rankIdeasForFeed(
      [
        idea("private", { supporters: 999, visibility: "private" }),
        idea("public", { supporters: 1 }),
      ],
      { limit: 5 },
    );

    expect(feed.map((entry) => entry.id)).toEqual(["public"]);
  });

  it("does not repeat ideas already shown above", () => {
    const feed = rankIdeasForFeed(
      [idea("shown"), idea("fresh", { supporters: 1 })],
      { excludeIds: ["shown"], limit: 5 },
    );

    expect(feed.map((entry) => entry.id)).toEqual(["fresh"]);
  });

  it("can keep zero-signal ideas out of the feed", () => {
    expect(
      rankIdeasForFeed([idea("quiet", { supporters: 0 })], { limit: 5 }),
    ).toHaveLength(0);
  });
});

describe("bestFeedbackOpportunity", () => {
  const forms: Record<string, { enabled: boolean; questions: unknown[] }> = {
    answerable: { enabled: true, questions: [{}] },
    disabled: { enabled: false, questions: [{}] },
    empty: { enabled: true, questions: [] },
  };

  it("picks the most-supported idea with a real, enabled form", () => {
    const result = bestFeedbackOpportunity(
      [
        idea("empty", { supporters: 500 }),
        idea("disabled", { supporters: 400 }),
        idea("answerable", { supporters: 100 }),
      ],
      (id) => forms[id],
    );

    expect(result?.id).toBe("answerable");
  });

  it("returns null when no idea can accept feedback", () => {
    expect(
      bestFeedbackOpportunity(
        [idea("disabled", { supporters: 400 })],
        (id) => forms[id],
      ),
    ).toBeNull();
  });
});
