import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

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
import { AcquisitionPanel } from "@/features/analytics/components/acquisition-panel";
import { ActivityList } from "@/features/analytics/components/activity-list";
import { AiInsightsPanel } from "@/features/analytics/components/ai-insights-panel";
import { AnalyticsChartPanel } from "@/features/analytics/components/analytics-chart-panel";
import { AnalyticsPeriodSelect } from "@/features/analytics/components/analytics-period";
import { AnalyticsQuickActions } from "@/features/analytics/components/analytics-quick-actions";
import {
  AnalyticsServiceUnavailable,
  AnalyticsSignedOut,
} from "@/features/analytics/components/analytics-state";
import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { ConversionPanel } from "@/features/analytics/components/conversion-panel";
import { FeedbackBreakdown } from "@/features/analytics/components/feedback-breakdown";
import {
  Recommendations,
  RecommendationsBand,
} from "@/features/analytics/components/recommendations";
import {
  analyticsWindow,
  formatSeriesDate,
  parseAnalyticsPeriod,
  recommendIdeaActions,
  type AnalyticsPeriod,
} from "@/features/analytics/lib/analytics";
import { getAiInsightsEntitlement } from "@/features/analytics/lib/entitlements";
import { getIdeaAnalyticsWorkspace } from "@/features/analytics/server/workspace";
import { formatCompactMoney, formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Idea analytics overview",
  description:
    "Support growth, estimated interest, feedback, and recent activity for one idea.",
};

type PageProps = {
  params: Promise<{ id: string }>;
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
  return `${current} - ${previousChange >= 0 ? "+" : ""}${previousChange.toLocaleString("en-US")} in the ${period} days before.`;
}

export default async function AnalyticsOverviewPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const period = parseAnalyticsPeriod(query.period);
  const result = await getIdeaAnalyticsWorkspace(id, period);
  if (result.status === "not_found") notFound();
  if (result.status === "signed_out") {
    return <AnalyticsSignedOut next={`/d/creator/ideas/${id}/insights`} />;
  }
  if (result.status === "unavailable") {
    return (
      <AnalyticsServiceUnavailable
        description={result.reason}
        retryHref={`/d/creator/ideas/${id}/insights`}
      />
    );
  }

  const view = result.view;
  const range = analyticsWindow(view.series, period);
  const recommendations = recommendIdeaActions(view.idea);
  const entitlement = getAiInsightsEntitlement();
  const feedback = view.feedback;

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

  const views = view.summary.views;
  const uniqueSessions = view.summary.uniqueSessions;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Analytics overview
          </p>
          <p className="mt-1 text-sm text-muted">
            Basic analytics stay available without premium access. Support and
            interest figures come from confirmed product activity; views are
            recorded server-side.
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
          value={view.summary.supporters.toLocaleString("en-US")}
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
          value={<Amount value={view.summary.estimatedInterest} compact />}
          hint={
            interestChange
              ? `${interestChange} change over ${period} days${
                  range.hasComparison && previousInterestChange
                    ? ` - ${previousInterestChange} in the period before.`
                    : ". No earlier period to compare yet."
                }`
              : "A trend appears after the first daily snapshot."
          }
        />
        <MetricCard
          label="Feedback received"
          icon={Comment01Icon}
          value={
            feedback
              ? feedback.responseCount.toLocaleString("en-US")
              : "Not available"
          }
          unavailable={
            feedback
              ? undefined
              : "Feedback analytics are not available for this workspace."
          }
          hint={
            feedback?.ratingAverage !== null &&
            feedback?.ratingAverage !== undefined
              ? `Average ${feedback.ratingAverage.toFixed(1)} / 5 across structured responses. All time.`
              : view.dataSource === "preview"
                ? "No overall rating question is configured. Open the feedback view for choice and written answers."
                : "No overall rating question is configured. Open the feedback view for choice answers; written text is not exposed in the live report."
          }
        />
        <MetricCard
          label="Idea views"
          icon={EyeIcon}
          value={
            views === null ? "Not measured" : views.toLocaleString("en-US")
          }
          unavailable={
            views === null
              ? "View tracking is not available in this workspace. It appears once the analytics API records views."
              : undefined
          }
          hint={
            views === null
              ? undefined
              : uniqueSessions === null
                ? "Unique sessions are not available for this period."
                : `${uniqueSessions.toLocaleString("en-US")} unique session${
                    uniqueSessions === 1 ? "" : "s"
                  }${view.summary.uniqueSessionsExact ? "" : " (sum of daily uniques)"} in this period.`
          }
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

      {view.conversion ? (
        <ConversionPanel conversion={view.conversion} />
      ) : view.premium ? (
        <AnalyticsUnavailable
          icon={ChartLineData02Icon}
          title="Conversion rates are unavailable"
          description="Premium access is active, but the validation report did not return conversion rates for this period. Try again in a moment."
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_20rem]">
        {feedback ? (
          <FeedbackBreakdown
            feedback={feedback}
            formVersion={
              view.dataSource === "preview"
                ? view.idea.feedbackForm?.version
                : undefined
            }
          />
        ) : (
          <AnalyticsUnavailable
            icon={Comment01Icon}
            title="Feedback breakdown"
            description="Feedback analytics are not available for this workspace yet."
          />
        )}
        {view.acquisition ? (
          <AcquisitionPanel acquisition={view.acquisition} compact />
        ) : (
          <AnalyticsUnavailable
            icon={ChartLineData02Icon}
            title="Traffic sources"
            description={
              view.dataSource === "live"
                ? "Acquisition sources are not available in this view. Open the traffic tab for the premium source and country breakdowns, or to retry if the report did not load."
                : "Live view tracking is not connected in preview. The preview fixtures never contained view or source data."
            }
            bullets={[
              "Server-derived sources: feed, search, direct, and internal links",
              "Country-level view distribution",
              "No public view counts are ever added to the idea",
            ]}
          />
        )}
        <div className="lg:col-span-2 xl:col-span-1">
          <AiInsightsPanel entitlement={entitlement} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ActivityList activity={view.activity} dataSource={view.dataSource} />
        <AnalyticsQuickActions ideaId={view.idea.id} />
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
        {view.dataSource === "live"
          ? "Supporter, interest, and feedback figures come from the analytics API. Views are private to the creator and never appear as a public count on the idea."
          : "Charts use preview data until the analytics endpoint is connected. No view count is invented."}
      </p>
    </div>
  );
}
