import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import {
  analyticsDateRange,
  type AnalyticsPeriod,
} from "@/features/analytics/lib/analytics";
import { summariseFeedback } from "@/features/analytics/lib/feedback-summary";
import type {
  AnalyticsFeedbackQuestionView,
  AnalyticsFeedbackView,
  AnalyticsTierView,
  AnalyticsWorkspaceView,
} from "@/features/analytics/lib/types";

const QUESTION_TYPES: Readonly<
  Record<string, AnalyticsFeedbackQuestionView["type"]>
> = {
  boolean: "BOOLEAN",
  "long-text": "TEXT",
  "multi-choice": "MULTI_CHOICE",
  rating: "RATING",
  scale: "RATING",
  "short-text": "TEXT",
  "single-choice": "SINGLE_CHOICE",
};

function previewFeedback(): AnalyticsFeedbackView {
  const summary = summariseFeedback(
    previewAnalytics.idea.feedbackForm,
    previewAnalytics.demoSubmissions,
  );

  const questions = summary.questions.map(
    (question): AnalyticsFeedbackQuestionView => ({
      answered: question.answered,
      average: question.ratingAverage,
      distribution: question.ratingDistribution,
      id: question.question.id,
      prompt: question.question.label,
      tallies: question.tallies.map((tally) => ({
        count: tally.count,
        label: tally.label,
        share: tally.share,
      })),
      textAnswers: question.textAnswers,
      type: QUESTION_TYPES[question.question.type] ?? "TEXT",
    }),
  );

  const ratingDistribution = summary.questions
    .flatMap((question) => question.ratingDistribution)
    .reduce<{ rating: number; count: number }[]>((entries, point) => {
      const existing = entries.find((entry) => entry.rating === point.rating);
      if (existing) existing.count += point.count;
      else entries.push({ count: point.count, rating: point.rating });
      return entries;
    }, [])
    .sort((left, right) => left.rating - right.rating);

  return {
    configured: summary.configured,
    questions,
    ratingAverage: summary.ratingAverage,
    ratingCount: summary.ratingCount,
    ratingDistribution,
    responseCount: summary.responseCount,
    textAnswersAvailable: true,
  };
}

function previewTiers(): AnalyticsTierView[] {
  return previewAnalytics.supportersByTier.map((tier) => ({
    count: tier.count,
    key: tier.tier,
    label: tier.tier,
    weight: tier.weight,
  }));
}

/**
 * The preview workspace.
 *
 * Views are deliberately `null`: the fixtures never contained view data, and a
 * zero would claim the idea was measured and ignored. The API path fills the
 * same view model with real totals.
 */
export function previewAnalyticsWorkspace(
  period: AnalyticsPeriod,
  now: Date = new Date(),
): AnalyticsWorkspaceView {
  const range = analyticsDateRange(period, now);
  const feedback = previewFeedback();

  return {
    acquisition: null,
    activity: previewAnalytics.activity,
    conversion: null,
    dataSource: "preview",
    feedback,
    from: range.from,
    geography: null,
    idea: previewAnalytics.idea,
    period,
    premium: false,
    series: previewAnalytics.series,
    summary: {
      commentCount: 0,
      estimatedInterest: previewAnalytics.idea.prePledged,
      feedbackCount: feedback.responseCount,
      feedbackScore:
        feedback.ratingAverage ?? previewAnalytics.idea.feedbackScore,
      follows: null,
      lastAggregatedDay: null,
      prePledges: null,
      saves: null,
      supporters: previewAnalytics.idea.supporters,
      uniqueSessions: null,
      uniqueSessionsExact: false,
      views: null,
    },
    tiers: previewTiers(),
    to: range.to,
    viewSeries: [],
  };
}
