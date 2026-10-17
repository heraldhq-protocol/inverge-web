import type { Metadata } from "next";
import { Suspense } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartLineData02Icon,
  Comment01Icon,
  Coins01Icon,
  EyeIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

import { Amount } from "@/components/ui/amount";
import { MetricCard } from "@/components/ui/metric-card";
import { ActivityList } from "@/features/analytics/components/activity-list";
import { AiInsightsPanel } from "@/features/analytics/components/ai-insights-panel";
import { AnalyticsChartPanel } from "@/features/analytics/components/analytics-chart-panel";
import { AnalyticsPeriodSelect } from "@/features/analytics/components/analytics-period";
import { AnalyticsQuickActions } from "@/features/analytics/components/analytics-quick-actions";
import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { ConfiguredFeedbackBreakdown } from "@/features/analytics/components/configured-feedback-breakdown";
import {
  Recommendations,
  RecommendationsBand,
} from "@/features/analytics/components/recommendations";
import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import {
  analyticsWindow,
  formatSeriesDate,
  parseAnalyticsPeriod,
  recommendIdeaActions,
  type AnalyticsPeriod,
} from "@/features/analytics/lib/analytics";
import { getAiInsightsEntitlement } from "@/features/analytics/lib/entitlements";
import { summariseFeedback } from "@/features/analytics/lib/feedback-summary";
import { formatCompactMoney, formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Idea analytics overview",
  description:
    "Support growth, estimated interest, feedback, and recent activity for one idea.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function supporterHint(
  period: AnalyticsPeriod,
  change: number | null,
  previousChange: number | null,
  hasComparison: boolean,
): string {
  if (change === null) {
    return "A trend appears after the first daily snapshot.";
  }
  const current = `${change >= 0 ? "+" : ""}${change.toLocaleString("en-US")} net over ${period} days`;
  if (!hasComparison || previousChange === null) {
    return `${current}. Not enough history for a previous period yet.`;
  }
  return `${current} · ${previousChange >= 0 ? "+" : ""}${previousChange.toLocaleString("en-US")} in the ${period} days before.`;
}

export default async function AnalyticsOverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = parseAnalyticsPeriod(params.period);
  const range = analyticsWindow(previewAnalytics.series, period);
  const recommendations = recommendIdeaActions(previewAnalytics.idea);
  const entitlement = getAiInsightsEntitlement();
  const feedbackSummary = summariseFeedback(
    previewAnalytics.idea.feedbackForm,
    previewAnalytics.demoSubmissions,
  );

  const first = range.points[0];
  const last = range.points[range.points.length - 1];
  const supporterPoints = range.points.map((point) => ({
    date: point.date,
    value: point.supporters,
  }));
  const interestPoints = range.points.map((point) => ({
    date: point.date,
    value: Number(point.estimatedInterestAtomic),
  }));
  const interestChange =
    range.interestChangeAtomic !== null
      ? formatCompactMoney({
          atomic: range.interestChangeAtomic,
          currency: "USD",
          decimals: 2,
        })
      : null;
  const previousInterestChange =
    range.previousInterestChangeAtomic !== null
      ? formatCompactMoney({
          atomic: range.previousInterestChangeAtomic,
          currency: "USD",
          decimals: 2,
        })
      : null;

  const supporterSummary =
    first && last
      ? `Supporter growth from ${first.supporters} on ${formatSeriesDate(first.date, true)} to ${last.supporters} on ${formatSeriesDate(last.date, true)}.`
      : "No supporter history yet.";
  const interestSummary =
    first && last
      ? `Estimated interest from ${formatMoney({
          atomic: first.estimatedInterestAtomic,
          currency: "USD",
          decimals: 2,
        })} on ${formatSeriesDate(first.date, true)} to ${formatMoney({
          atomic: last.estimatedInterestAtomic,
          currency: "USD",
          decimals: 2,
        })} on ${formatSeriesDate(last.date, true)}.`
      : "No estimated-interest history yet.";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Analytics overview
          </p>
          <p className="mt-1 text-sm text-muted">
            Basic analytics stay available without a paid plan. Figures come
            from the same signals readers see on the public page.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-9 w-40 rounded-lg border border-border bg-surface" />
          }
        >
          <AnalyticsPeriodSelect period={period} />
        </Suspense>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total supporters"
          icon={UserMultiple02Icon}
          value={previewAnalytics.idea.supporters.toLocaleString("en-US")}
          hint={supporterHint(
            period,
            range.supporterChange,
            range.previousSupporterChange,
            range.hasComparison,
          )}
        />
        <MetricCard
          label="Estimated interest"
          icon={Coins01Icon}
          value={<Amount value={previewAnalytics.idea.prePledged} compact />}
          hint={
            interestChange
              ? `${interestChange} change over ${period} days${
                  range.hasComparison && previousInterestChange
                    ? ` · ${previousInterestChange} in the period before.`
                    : ". No earlier period to compare yet."
                }`
              : "A trend appears after the first daily snapshot."
          }
        />
        <MetricCard
          label="Feedback received"
          icon={Comment01Icon}
          value={feedbackSummary.responseCount.toLocaleString("en-US")}
          hint={
            feedbackSummary.hasRating && feedbackSummary.ratingAverage !== null
              ? `Average ${feedbackSummary.ratingAverage.toFixed(1)} / 5 across structured responses. All time.`
              : "No overall rating question is configured. Open the feedback view for choice and written answers."
          }
        />
        <MetricCard
          label="Idea views"
          icon={EyeIcon}
          value="Not measured"
          unavailable="View tracking is not collected yet. It appears here once the analytics API records views."
        />
      </dl>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <AnalyticsChartPanel
          title="Supporter growth"
          description="How many people are showing interest in your idea."
          legend="Supporters"
          points={supporterPoints}
          summary={supporterSummary}
          formatValue={(value) => Math.round(value).toLocaleString("en-US")}
        />
        <AnalyticsChartPanel
          title="Estimated interest trend"
          description="Weighted estimate based on verification tiers. Not money raised."
          legend="Estimated interest"
          points={interestPoints}
          summary={interestSummary}
          tone="chain"
          formatValue={(value) =>
            formatCompactMoney({
              atomic: String(Math.round(value)),
              currency: "USD",
              decimals: 2,
            })
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_20rem]">
        <ConfiguredFeedbackBreakdown
          form={previewAnalytics.idea.feedbackForm}
          submissions={previewAnalytics.demoSubmissions}
        />
        <AnalyticsUnavailable
          icon={ChartLineData02Icon}
          title="Traffic sources"
          description="Which pages and referrers bring readers to this idea. The current API does not record views, so no source breakdown can be shown."
          bullets={[
            "Homepage, search, direct link, and topic pages",
            "Referral performance by source",
            "No public view counts are ever added to the idea",
          ]}
        />
        <div className="lg:col-span-2 xl:col-span-1">
          <AiInsightsPanel entitlement={entitlement} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ActivityList activity={previewAnalytics.activity} />
        <AnalyticsQuickActions ideaId={previewAnalytics.idea.id} />
      </div>

      <Recommendations recommendations={recommendations} />
      <RecommendationsBand recommendation={recommendations[0]} />

      <p className="flex items-start gap-1.5 text-[0.6875rem] leading-4 text-muted">
        <HugeiconsIcon
          icon={EyeIcon}
          size={12}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mt-0.5 shrink-0"
        />
        Supporter, interest, and feedback figures are shared with the public idea
        page. Charts use preview data until the analytics endpoint is connected.
      </p>
    </div>
  );
}
