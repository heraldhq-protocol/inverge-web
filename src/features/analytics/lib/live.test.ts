import { describe, expect, it } from "vitest";

import {
  mapAcquisition,
  mapActivity,
  mapConversion,
  mapFeedback,
  mapGeography,
  mapIdeaAnalyticsSummary,
  mapInsightsSeries,
  mapTiers,
  mapViewSeries,
  type ApiIdeaAnalyticsSummary,
  type ApiIdeaAnalyticsValidation,
  type ApiIdeaInsights,
} from "@/features/analytics/lib/live";

function insights(overrides: Partial<ApiIdeaInsights> = {}): ApiIdeaInsights {
  return {
    comments: { count: 0, top: [] },
    feedback: { perQuestion: [], ratingDistribution: {} },
    gate: null,
    idea: {
      askAmount: 5000,
      createdAt: "2026-09-01T00:00:00.000Z",
      discoverabilityTier: "DISCOVERABLE",
      id: "idea-1",
      status: "VALIDATING",
      title: "A test idea",
      validatingSince: "2026-09-02T00:00:00.000Z",
    },
    prePledge: { byCurrency: [], byTier: [] },
    summary: {
      commentCount: 0,
      feedbackCount: 0,
      feedbackScore: 0,
      rawPrePledgeTotalUsd: 0,
      supporterCount: 0,
      weightedPrePledgeTotal: 0,
    },
    timeseries: [],
    velocity: { supporters: 0, weighted: 0, windowDays: 7 },
    ...overrides,
  };
}

const summary: ApiIdeaAnalyticsSummary = {
  from: "2026-10-20",
  generatedAt: "2026-10-26T12:00:00.000Z",
  ideaId: "idea-1",
  lastAggregatedDay: "2026-10-25",
  to: "2026-10-26",
  totals: { uniqueSessions: 4, uniqueSessionsExact: true, views: 0 },
  validation: {
    commentCount: 1,
    estimatedInterestUsd: "123.45",
    feedbackCount: 2,
    feedbackScore: 4.5,
    follows: null,
    prePledges: 3,
    saves: null,
    supporters: 7,
  },
};

describe("mapIdeaAnalyticsSummary", () => {
  it("keeps a real zero-view range as zero and preserves the exactness flag", () => {
    const view = mapIdeaAnalyticsSummary(summary);

    expect(view.views).toBe(0);
    expect(view.uniqueSessions).toBe(4);
    expect(view.uniqueSessionsExact).toBe(true);
    expect(view.supporters).toBe(7);
    expect(view.prePledges).toBe(3);
    expect(view.estimatedInterest.atomic).toBe("12345");
  });

  it("does not turn a missing premium field into a fabricated number", () => {
    const view = mapIdeaAnalyticsSummary(summary);

    expect(view.follows).toBeNull();
    expect(view.saves).toBeNull();
  });
});

describe("mapFeedback", () => {
  it("maps ratings, boolean tallies, and text counts without inventing text", () => {
    const view = mapFeedback(
      insights({
        summary: {
          commentCount: 0,
          feedbackCount: 4,
          feedbackScore: 4.2,
          rawPrePledgeTotalUsd: 0,
          supporterCount: 0,
          weightedPrePledgeTotal: 0,
        },
        feedback: {
          ratingDistribution: { "1": 1, "5": 3 },
          perQuestion: [
            {
              answered: 4,
              average: 4.2,
              distribution: { "1": 1, "5": 3 },
              prompt: "How promising is this?",
              questionId: "q1",
              type: "RATING",
            },
            {
              answered: 4,
              no: 1,
              prompt: "Would you use it?",
              questionId: "q2",
              type: "BOOLEAN",
              yes: 3,
            },
            {
              answered: 2,
              prompt: "Why?",
              questionId: "q3",
              type: "TEXT",
            },
          ],
        },
      }),
    );

    expect(view.ratingAverage).toBe(4.2);
    expect(view.ratingCount).toBe(4);
    expect(view.ratingDistribution).toEqual([
      { count: 1, rating: 1 },
      { count: 3, rating: 5 },
    ]);
    expect(view.questions[1]?.tallies).toEqual([
      { count: 3, label: "Yes", share: 0.75 },
      { count: 1, label: "No", share: 0.25 },
    ]);
    expect(view.questions[2]?.textAnswers).toEqual([]);
    expect(view.textAnswersAvailable).toBe(false);
  });

  it("reports no rating average when there are no rating answers", () => {
    const view = mapFeedback(
      insights({
        summary: {
          commentCount: 0,
          feedbackCount: 1,
          feedbackScore: 0,
          rawPrePledgeTotalUsd: 0,
          supporterCount: 0,
          weightedPrePledgeTotal: 0,
        },
      }),
    );

    expect(view.ratingAverage).toBeNull();
    expect(view.ratingCount).toBe(0);
  });
});

describe("mapActivity", () => {
  it("derives activity from real snapshot deltas", () => {
    const activity = mapActivity(
      insights({
        timeseries: [
          {
            capturedAt: "2026-10-19T00:00:00.000Z",
            supporterCount: 10,
            weightedTotal: 100,
          },
          {
            capturedAt: "2026-10-20T00:00:00.000Z",
            supporterCount: 12,
            weightedTotal: 150,
          },
        ],
      }),
    );

    expect(activity).toHaveLength(2);
    expect(activity[0]).toMatchObject({
      detail: "+2 supporters",
      kind: "supporter",
      title: "New supporters",
    });
    expect(activity[1]).toMatchObject({
      kind: "interest",
      title: "Estimated interest increased",
    });
  });

  it("falls back to the publication date rather than an empty feed", () => {
    const activity = mapActivity(insights());

    expect(activity).toHaveLength(1);
    expect(activity[0]).toMatchObject({
      date: "2026-09-02T00:00:00.000Z",
      kind: "published",
      title: "Idea published",
    });
  });

  it("does not call a draft published", () => {
    const base = insights();
    const activity = mapActivity({
      ...base,
      idea: { ...base.idea, status: "DRAFT", validatingSince: null },
    });

    expect(activity[0]).toMatchObject({
      date: "2026-09-01T00:00:00.000Z",
      title: "Idea created",
    });
  });
});

describe("report mappers", () => {
  it("maps the daily view series", () => {
    const view = mapViewSeries({
      from: "2026-10-20",
      generatedAt: "2026-10-26T12:00:00.000Z",
      ideaId: "idea-1",
      interval: "day",
      points: [
        {
          bucket: "2026-10-20",
          prePledgeCount: 0,
          supportCount: 1,
          uniqueActors: 1,
          uniqueSessions: 2,
          views: 5,
        },
      ],
      to: "2026-10-26",
      uniqueSessionsIsSum: false,
    });

    expect(view).toEqual([
      {
        date: "2026-10-20",
        prePledgeCount: 0,
        supportCount: 1,
        uniqueSessions: 2,
        views: 5,
      },
    ]);
  });

  it("maps acquisition labels and preserves a null share when the denominator is zero", () => {
    const view = mapAcquisition({
      from: "2026-10-20",
      generatedAt: "2026-10-26T12:00:00.000Z",
      ideaId: "idea-1",
      premium: true,
      sources: [
        { sharePct: null, source: "feed", uniqueSessions: 0, views: 0 },
      ],
      to: "2026-10-26",
      totalViews: 0,
    });

    expect(view.sources[0]).toMatchObject({
      label: "Feed",
      sharePct: null,
    });
  });

  it("maps known country codes and falls back to an unknown code", () => {
    const view = mapGeography({
      countries: [
        {
          countryCode: "NG",
          sharePct: 60,
          uniqueSessions: 3,
          views: 6,
        },
        {
          countryCode: "ZZ",
          sharePct: 40,
          uniqueSessions: 2,
          views: 4,
        },
      ],
      from: "2026-10-20",
      generatedAt: "2026-10-26T12:00:00.000Z",
      ideaId: "idea-1",
      premium: true,
      to: "2026-10-26",
      totalViews: 10,
      truncated: true,
    });

    expect(view.countries[0]?.label).toBe("Nigeria");
    expect(view.countries[1]?.label).toBe("ZZ");
    expect(view.truncated).toBe(true);
  });

  it("maps tier labels and weighted money", () => {
    const tiers = mapTiers(
      insights({
        prePledge: {
          byCurrency: [],
          byTier: [
            { count: 2, sumUsd: 100, tier: "EMAIL", weighted: 25 },
            { count: 1, sumUsd: 100, tier: "VERIFIED", weighted: 100 },
          ],
        },
      }),
    );

    expect(tiers).toEqual([
      {
        count: 2,
        key: "EMAIL",
        label: "Email",
        weighted: { atomic: "2500", currency: "USD", decimals: 2 },
      },
      {
        count: 1,
        key: "VERIFIED",
        label: "Identity verified",
        weighted: { atomic: "10000", currency: "USD", decimals: 2 },
      },
    ]);
  });

  it("maps insight snapshots to cumulative points", () => {
    const points = mapInsightsSeries(
      insights({
        timeseries: [
          {
            capturedAt: "2026-10-20T00:00:00.000Z",
            supporterCount: 3,
            weightedTotal: 12.5,
          },
        ],
      }),
    );

    expect(points).toEqual([
      {
        date: "2026-10-20T00:00:00.000Z",
        estimatedInterestAtomic: "1250",
        supporters: 3,
      },
    ]);
  });

  it("only exposes conversion rates when the report is premium", () => {
    const validation: ApiIdeaAnalyticsValidation = {
      counts: summary.validation,
      conversion: {
        viewToCommentPct: 1,
        viewToFeedbackPct: 2,
        viewToSupportPct: 3,
      },
      from: "2026-10-20",
      generatedAt: "2026-10-26T12:00:00.000Z",
      ideaId: "idea-1",
      premium: false,
      to: "2026-10-26",
    };

    expect(mapConversion(validation)).toBeNull();
    expect(mapConversion({ ...validation, premium: true })).toEqual({
      viewToCommentPct: 1,
      viewToFeedbackPct: 2,
      viewToSupportPct: 3,
    });
  });

  it("preserves a real zero rate rather than replacing it with null", () => {
    const validation: ApiIdeaAnalyticsValidation = {
      counts: summary.validation,
      conversion: {
        viewToCommentPct: 0,
        viewToFeedbackPct: 0,
        viewToSupportPct: 0,
      },
      from: "2026-10-20",
      generatedAt: "2026-10-26T12:00:00.000Z",
      ideaId: "idea-1",
      premium: true,
      to: "2026-10-26",
    };

    expect(mapConversion(validation)).toEqual({
      viewToCommentPct: 0,
      viewToFeedbackPct: 0,
      viewToSupportPct: 0,
    });
  });

  it("returns null when the API says conversion is not computed", () => {
    const validation: ApiIdeaAnalyticsValidation = {
      counts: summary.validation,
      conversion: null,
      from: "2026-10-20",
      generatedAt: "2026-10-26T12:00:00.000Z",
      ideaId: "idea-1",
      premium: true,
      to: "2026-10-26",
    };

    expect(mapConversion(validation)).toBeNull();
  });
});
