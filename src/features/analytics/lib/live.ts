import { countryName } from "@/lib/countries";
import { decimalToUsdAmount, formatMoney } from "@/lib/money";

import type {
  AnalyticsAcquisitionView,
  AnalyticsActivity,
  AnalyticsConversionView,
  AnalyticsFeedbackQuestionView,
  AnalyticsFeedbackView,
  AnalyticsGeographyView,
  AnalyticsPoint,
  AnalyticsSummaryView,
  AnalyticsTierView,
  AnalyticsViewPoint,
} from "@/features/analytics/lib/types";

/**
 * The creator-insights payload (`GET /ideas/{id}/insights`).
 *
 * The API returns dates as ISO strings over the wire even though the service
 * builds them as `Date` objects, so the wire type says string.
 */
export type ApiIdeaInsights = {
  idea: {
    id: string;
    title: string;
    status: string;
    discoverabilityTier: string;
    createdAt: string;
    validatingSince: string | null;
    askAmount: number;
  };
  summary: {
    supporterCount: number;
    weightedPrePledgeTotal: number;
    rawPrePledgeTotalUsd: number;
    feedbackScore: number;
    feedbackCount: number;
    commentCount: number;
  };
  timeseries: {
    capturedAt: string;
    weightedTotal: number;
    supporterCount: number;
  }[];
  velocity: {
    windowDays: number;
    supporters: number;
    weighted: number;
  };
  prePledge: {
    byTier: {
      tier: string;
      count: number;
      sumUsd: number;
      weighted: number;
    }[];
    byCurrency: {
      currency: string;
      count: number;
      sumOriginal: number;
    }[];
  };
  feedback: {
    ratingDistribution: Record<string, number>;
    perQuestion: ApiFeedbackQuestion[];
  };
  comments: {
    count: number;
    top: unknown[];
  };
  gate: unknown;
};

export type ApiFeedbackQuestion = {
  questionId: string;
  prompt: string;
  type: "BOOLEAN" | "MULTI_CHOICE" | "RATING" | "SINGLE_CHOICE" | "TEXT";
  answered: number;
  average?: number;
  distribution?: Record<string, number>;
  tally?: Record<string, number>;
  yes?: number;
  no?: number;
};

export type ApiIdeaAnalyticsSummary = {
  ideaId: string;
  from: string;
  to: string;
  totals: {
    views: number;
    uniqueSessions: number;
    uniqueSessionsExact: boolean;
  };
  validation: {
    supporters: number;
    prePledges: number;
    feedbackCount: number;
    feedbackScore: number;
    commentCount: number;
    estimatedInterestUsd: string;
    follows: number | null;
    saves: number | null;
  };
  lastAggregatedDay: string | null;
  generatedAt: string;
};

export type ApiIdeaAnalyticsTimeseries = {
  ideaId: string;
  from: string;
  to: string;
  interval: "day" | "week" | "month";
  uniqueSessionsIsSum: boolean;
  points: {
    bucket: string;
    views: number;
    uniqueSessions: number;
    supportCount: number;
    prePledgeCount: number;
    uniqueActors: number;
  }[];
  generatedAt: string;
};

export type ApiIdeaAnalyticsValidation = {
  ideaId: string;
  from: string;
  to: string;
  counts: ApiIdeaAnalyticsSummary["validation"];
  conversion: {
    viewToSupportPct: number | null;
    viewToFeedbackPct: number | null;
    viewToCommentPct: number | null;
  } | null;
  premium: boolean;
  generatedAt: string;
};

export type ApiIdeaAnalyticsAcquisition = {
  ideaId: string;
  from: string;
  to: string;
  totalViews: number;
  sources: {
    source: string;
    views: number;
    uniqueSessions: number;
    sharePct: number | null;
  }[];
  premium: boolean;
  generatedAt: string;
};

export type ApiIdeaAnalyticsGeography = {
  ideaId: string;
  from: string;
  to: string;
  totalViews: number;
  countries: {
    countryCode: string;
    views: number;
    uniqueSessions: number;
    sharePct: number | null;
  }[];
  truncated: boolean;
  premium: boolean;
  generatedAt: string;
};

const SOURCE_LABELS: Readonly<Record<string, string>> = {
  direct: "Direct",
  feed: "Feed",
  internal: "Internal links",
  search: "Search",
};

const TIER_LABELS: Readonly<Record<string, string>> = {
  EMAIL: "Email",
  EXCLUDED: "Excluded",
  SOCIAL: "Social",
  VERIFIED: "Identity verified",
};

export function mapIdeaAnalyticsSummary(
  summary: ApiIdeaAnalyticsSummary,
): AnalyticsSummaryView {
  const validation = summary.validation;
  return {
    commentCount: validation.commentCount,
    estimatedInterest: decimalToUsdAmount(validation.estimatedInterestUsd),
    feedbackCount: validation.feedbackCount,
    feedbackScore: validation.feedbackScore,
    follows: validation.follows,
    lastAggregatedDay: summary.lastAggregatedDay,
    prePledges: validation.prePledges,
    saves: validation.saves,
    supporters: validation.supporters,
    uniqueSessions: summary.totals.uniqueSessions,
    uniqueSessionsExact: summary.totals.uniqueSessionsExact,
    views: summary.totals.views,
  };
}

export function mapInsightsSeries(insights: ApiIdeaInsights): AnalyticsPoint[] {
  return insights.timeseries.map((point) => ({
    date: point.capturedAt,
    estimatedInterestAtomic: decimalToUsdAmount(point.weightedTotal).atomic,
    supporters: point.supporterCount,
  }));
}

export function mapViewSeries(
  timeseries: ApiIdeaAnalyticsTimeseries,
): AnalyticsViewPoint[] {
  return timeseries.points.map((point) => ({
    date: point.bucket,
    prePledgeCount: point.prePledgeCount,
    supportCount: point.supportCount,
    uniqueSessions: point.uniqueSessions,
    views: point.views,
  }));
}

function distributionEntries(
  distribution: Record<string, number> | undefined,
): { rating: number; count: number }[] {
  return Object.entries(distribution ?? {})
    .map(([rating, count]) => ({ rating: Number(rating), count }))
    .filter((entry) => Number.isFinite(entry.rating))
    .sort((left, right) => left.rating - right.rating);
}

function feedbackQuestion(
  question: ApiFeedbackQuestion,
): AnalyticsFeedbackQuestionView {
  const tallies =
    question.type === "BOOLEAN"
      ? [
          { label: "Yes", count: question.yes ?? 0 },
          { label: "No", count: question.no ?? 0 },
        ]
      : Object.entries(question.tally ?? {}).map(([label, count]) => ({
          label,
          count,
        }));

  return {
    answered: question.answered,
    average: question.type === "RATING" ? (question.average ?? null) : null,
    distribution:
      question.type === "RATING"
        ? distributionEntries(question.distribution)
        : [],
    id: question.questionId,
    prompt: question.prompt,
    tallies: tallies.map((tally) => ({
      count: tally.count,
      label: tally.label,
      share: question.answered > 0 ? tally.count / question.answered : 0,
    })),
    textAnswers: [],
    type: question.type,
  };
}

/**
 * Maps the API's aggregate feedback payload.
 *
 * The endpoint returns counts and distributions, not submitted text. The view
 * says so rather than rendering an empty quote list that looks like nobody
 * wrote anything.
 */
export function mapFeedback(insights: ApiIdeaInsights): AnalyticsFeedbackView {
  const ratingDistribution = distributionEntries(
    insights.feedback.ratingDistribution,
  );
  const ratingCount = ratingDistribution.reduce(
    (total, entry) => total + entry.count,
    0,
  );
  const questions = insights.feedback.perQuestion.map(feedbackQuestion);

  return {
    configured: questions.length > 0,
    questions,
    ratingAverage:
      ratingCount > 0 ? Number(insights.summary.feedbackScore) : null,
    ratingCount,
    ratingDistribution,
    responseCount: insights.summary.feedbackCount,
    textAnswersAvailable: false,
  };
}

export function mapTiers(insights: ApiIdeaInsights): AnalyticsTierView[] {
  return insights.prePledge.byTier.map((tier) => ({
    count: tier.count,
    key: tier.tier,
    label: TIER_LABELS[tier.tier] ?? tier.tier,
    weighted: decimalToUsdAmount(tier.weighted),
  }));
}

/**
 * Recent aggregate activity from the daily snapshot series.
 *
 * The insights endpoint does not expose a per-event feed. Each row is therefore
 * a real change between two snapshots, labelled as such; no supporter, feedback
 * author, or pre-pledge identity is inferred.
 */
export function mapActivity(insights: ApiIdeaInsights): AnalyticsActivity[] {
  const points = insights.timeseries;
  const activity: AnalyticsActivity[] = [];

  for (let index = points.length - 1; index > 0; index -= 1) {
    const current = points[index];
    const previous = points[index - 1];
    if (!current || !previous) continue;

    const supporterDelta = current.supporterCount - previous.supporterCount;
    const interestDelta = current.weightedTotal - previous.weightedTotal;

    if (supporterDelta > 0) {
      activity.push({
        date: current.capturedAt,
        detail: `+${supporterDelta.toLocaleString("en-US")} supporters`,
        kind: "supporter",
        title: "New supporters",
      });
    }
    if (interestDelta > 0) {
      activity.push({
        date: current.capturedAt,
        detail: `+${formatMoney(decimalToUsdAmount(interestDelta))} weighted estimate`,
        kind: "interest",
        title: "Estimated interest increased",
      });
    }
    if (activity.length >= 4) break;
  }

  if (activity.length === 0) {
    activity.push({
      date: insights.idea.validatingSince ?? insights.idea.createdAt,
      detail: "Daily snapshots begin after the idea is published.",
      kind: "published",
      title:
        insights.idea.status === "DRAFT" ? "Idea created" : "Idea published",
    });
  }

  return activity.slice(0, 4);
}

export function mapConversion(
  validation: ApiIdeaAnalyticsValidation,
): AnalyticsConversionView | null {
  if (!validation.premium || !validation.conversion) return null;
  return {
    viewToCommentPct: validation.conversion.viewToCommentPct,
    viewToFeedbackPct: validation.conversion.viewToFeedbackPct,
    viewToSupportPct: validation.conversion.viewToSupportPct,
  };
}

export function mapAcquisition(
  acquisition: ApiIdeaAnalyticsAcquisition,
): AnalyticsAcquisitionView {
  return {
    premium: acquisition.premium,
    sources: acquisition.sources.map((source) => ({
      label: SOURCE_LABELS[source.source] ?? source.source,
      sharePct: source.sharePct,
      source: source.source,
      uniqueSessions: source.uniqueSessions,
      views: source.views,
    })),
    totalViews: acquisition.totalViews,
  };
}

export function mapGeography(
  geography: ApiIdeaAnalyticsGeography,
): AnalyticsGeographyView {
  return {
    countries: geography.countries.map((country) => ({
      countryCode: country.countryCode,
      label: countryName(country.countryCode) ?? country.countryCode,
      sharePct: country.sharePct,
      uniqueSessions: country.uniqueSessions,
      views: country.views,
    })),
    premium: geography.premium,
    totalViews: geography.totalViews,
    truncated: geography.truncated,
  };
}
