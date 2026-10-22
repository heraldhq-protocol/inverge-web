import { describe, expect, it } from "vitest";

import {
  enabledDestinations,
  overallRating,
  primaryDestination,
  validateCommunityUrl,
  validateFeedbackAnswers,
  validateFeedbackForm,
} from "@/features/feedback/lib/feedback";
import type {
  CommunityInvite,
  FeedbackAnswers,
  FeedbackForm,
} from "@/features/feedback/types";

function form(overrides: Partial<FeedbackForm> = {}): FeedbackForm {
  return {
    description: "Help the creator.",
    enabled: true,
    published: true,
    title: "Share your feedback",
    updatedAt: "2026-10-16T09:00:00.000Z",
    version: 2,
    questions: [
      {
        id: "rating",
        label: "How promising?",
        required: true,
        type: "rating",
      },
      {
        id: "interest",
        label: "What describes your interest?",
        required: false,
        type: "single-choice",
        options: [
          { id: "a", label: "Use it" },
          { id: "b", label: "Recommend it" },
        ],
      },
      {
        id: "blockers",
        label: "What would stop you?",
        required: false,
        type: "multi-choice",
        options: [
          { id: "c", label: "Price" },
          { id: "d", label: "Trust" },
        ],
      },
      {
        id: "trust",
        label: "Would you trust it?",
        required: false,
        type: "boolean",
      },
      {
        id: "note",
        label: "Anything else?",
        required: false,
        type: "long-text",
      },
      {
        id: "scale",
        label: "How confident?",
        required: false,
        type: "scale",
        scale: { min: 1, max: 5, minLabel: "Low", maxLabel: "High" },
      },
    ],
    ...overrides,
  };
}

describe("validateFeedbackForm", () => {
  it("allows a disabled form with no questions", () => {
    expect(
      validateFeedbackForm({ enabled: false, questions: [], title: "" }),
    ).toEqual([]);
  });

  it("requires a title and at least one question when enabled", () => {
    const issues = validateFeedbackForm({
      enabled: true,
      questions: [],
      title: "   ",
    });

    expect(issues.map((issue) => issue.field)).toContain("title");
    expect(issues.map((issue) => issue.field)).toContain("questions");
  });

  it("flags duplicate labels and choice questions with too few options", () => {
    const issues = validateFeedbackForm(
      form({
        questions: [
          { id: "one", label: "Same", required: false, type: "short-text" },
          { id: "two", label: "same", required: false, type: "short-text" },
          {
            id: "three",
            label: "Pick one",
            required: false,
            type: "single-choice",
            options: [{ id: "a", label: "Only" }],
          },
        ],
      }),
    );

    expect(
      issues.some((issue) => issue.message.includes("already uses this label")),
    ).toBe(true);
    expect(
      issues.some((issue) => issue.message.includes("at least two options")),
    ).toBe(true);
  });

  it("rejects a scale whose bounds are inverted", () => {
    const issues = validateFeedbackForm(
      form({
        questions: [
          {
            id: "scale",
            label: "Confidence",
            required: false,
            type: "scale",
            scale: { min: 5, max: 2, minLabel: "A", maxLabel: "B" },
          },
        ],
      }),
    );

    expect(issues.some((issue) => issue.message.includes("lower number"))).toBe(
      true,
    );
  });
});

describe("validateFeedbackAnswers", () => {
  it("requires a required answer and accepts a complete one", () => {
    const answers: FeedbackAnswers = { rating: 4 };

    expect(validateFeedbackAnswers(form(), answers)).toEqual({});

    expect(validateFeedbackAnswers(form(), {}).rating).toBe(
      "This question is required.",
    );
  });

  it("rejects an out-of-range rating, unknown choice and empty multi-select", () => {
    const issues = validateFeedbackAnswers(form(), {
      rating: 9,
      interest: "not-an-option",
      blockers: [],
    });

    expect(issues.rating).toBeDefined();
    expect(issues.interest).toBeDefined();
  });

  it("accepts a valid single choice, multi-select, boolean and scale answer", () => {
    const issues = validateFeedbackAnswers(form(), {
      rating: 5,
      interest: "Use it",
      blockers: ["Price", "Trust"],
      trust: true,
      scale: 4,
      note: "A useful note",
    });

    expect(issues).toEqual({});
  });

  it("does not require an optional question", () => {
    expect(validateFeedbackAnswers(form(), { rating: 3 })).toEqual({});
  });
});

describe("overallRating", () => {
  it("uses only configured rating questions", () => {
    const result = overallRating(form(), [
      { rating: 5, scale: 1, interest: "Use it" },
      { rating: 4, scale: 5 },
    ]);

    expect(result.count).toBe(2);
    expect(result.average).toBe(4.5);
  });

  it("ignores a choice-only form instead of inventing a rating", () => {
    const choiceOnly = form({
      questions: [
        {
          id: "choice",
          label: "Pick",
          required: false,
          type: "single-choice",
          options: [
            { id: "a", label: "One" },
            { id: "b", label: "Two" },
          ],
        },
      ],
    });

    expect(overallRating(choiceOnly, [{ choice: "One" }])).toEqual({
      average: 0,
      count: 0,
    });
  });
});

function invite(
  destinations: CommunityInvite["destinations"],
): CommunityInvite {
  return {
    description: "",
    destinations,
    enabled: true,
    primaryDestinationId: destinations[0]?.id ?? null,
    showAfterFeedback: true,
    showOnIdeaPage: false,
    title: "Stay connected",
  };
}

describe("validateCommunityUrl", () => {
  it("accepts https links and in-product profile paths", () => {
    expect(validateCommunityUrl("https://chat.whatsapp.com/abc")).toEqual({
      url: "https://chat.whatsapp.com/abc",
    });
    expect(validateCommunityUrl("/creators/amara")).toEqual({
      url: "/creators/amara",
    });
  });

  it("rejects unsafe or non-https links", () => {
    expect("error" in validateCommunityUrl("javascript:alert(1)")).toBe(true);
    expect("error" in validateCommunityUrl("http://example.com")).toBe(true);
    expect("error" in validateCommunityUrl("")).toBe(true);
    expect("error" in validateCommunityUrl("//example.com")).toBe(true);
  });
});

describe("enabledDestinations", () => {
  it("drops disabled and invalid destinations and resolves a primary", () => {
    const community = invite([
      {
        enabled: true,
        id: "valid",
        kind: "whatsapp",
        label: "WhatsApp",
        url: "https://chat.whatsapp.com/abc",
      },
      {
        enabled: false,
        id: "disabled",
        kind: "telegram",
        label: "Telegram",
        url: "https://t.me/abc",
      },
      {
        enabled: true,
        id: "invalid",
        kind: "website",
        label: "Broken",
        url: "javascript:alert(1)",
      },
    ]);

    const destinations = enabledDestinations(community);

    expect(destinations.map((destination) => destination.id)).toEqual([
      "valid",
    ]);
    expect(primaryDestination(community)?.id).toBe("valid");
  });

  it("returns nothing when the invitation is off", () => {
    const community = {
      ...invite([
        {
          enabled: true,
          id: "valid",
          kind: "website",
          label: "Site",
          url: "https://example.com",
        },
      ]),
      enabled: false,
    };

    expect(enabledDestinations(community)).toEqual([]);
  });
});
