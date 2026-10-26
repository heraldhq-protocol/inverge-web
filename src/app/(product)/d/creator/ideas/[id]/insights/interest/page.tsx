import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Coins01Icon, Comment01Icon } from "@hugeicons/core-free-icons";

import { Amount } from "@/components/ui/amount";
import { MetricCard } from "@/components/ui/metric-card";
import { AiInsightsPanel } from "@/features/analytics/components/ai-insights-panel";
import { AnalyticsChartPanel } from "@/features/analytics/components/analytics-chart-panel";
import { AnalyticsPeriodSelect } from "@/features/analytics/components/analytics-period";
import {
  AnalyticsServiceUnavailable,
  AnalyticsSignedOut,
} from "@/features/analytics/components/analytics-state";
import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { FeedbackBreakdown } from "@/features/analytics/components/feedback-breakdown";
import {
  analyticsWindow,
  formatSeriesDate,
  parseAnalyticsPeriod,
} from "@/features/analytics/lib/analytics";
import { getAiInsightsEntitlement } from "@/features/analytics/lib/entitlements";
import { getIdeaAnalyticsWorkspace } from "@/features/analytics/server/workspace";
import { formatCompactMoney, formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Interest and feedback | Idea analytics",
  description:
    "Estimated funding interest and structured feedback for one idea, with observed data kept separate from interpretation.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InterestAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const period = parseAnalyticsPeriod(query.period);
  const result = await getIdeaAnalyticsWorkspace(id, period);
  if (result.status === "not_found") notFound();
  if (result.status === "signed_out") {
    return (
      <AnalyticsSignedOut next={`/d/creator/ideas/${id}/insights/interest`} />
    );
  }
  if (result.status === "unavailable") {
    return (
      <AnalyticsServiceUnavailable
        description={result.reason}
        retryHref={`/d/creator/ideas/${id}/insights/interest`}
      />
    );
  }

  const view = result.view;
  const range = analyticsWindow(view.series, period);
  const first = range.points[0];
  const last = range.points[range.points.length - 1];
  const points = range.points.map((point) => ({
    date: point.date,
    value: Number(point.estimatedInterestAtomic),
  }));
  const change =
    range.interestChangeAtomic !== null
      ? formatCompactMoney({
          atomic: range.interestChangeAtomic,
          currency: "USD",
          decimals: 2,
        })
      : null;
  const previous =
    range.previousInterestChangeAtomic !== null
      ? formatCompactMoney({
          atomic: range.previousInterestChangeAtomic,
          currency: "USD",
          decimals: 2,
        })
      : null;
  const entitlement = getAiInsightsEntitlement();
  const feedback = view.feedback;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Interest and feedback
          </p>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Estimated interest is a weighted, non-binding signal. It is not
            money raised, a pledge, or proof that anyone will contribute.
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

      <dl className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Estimated interest"
          icon={Coins01Icon}
          value={<Amount value={view.summary.estimatedInterest} compact />}
          hint={
            view.idea.status === "draft"
              ? "Weighted by verification tier. This draft is not public yet."
              : "Weighted by verification tier. Same figure as the public page."
          }
        />
        <MetricCard
          label={`Change, ${period} days`}
          value={change ?? "No history"}
          hint={
            range.hasComparison && previous
              ? `Previous ${period} days: ${previous}.`
              : "Not enough history for a previous period yet."
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
              ? `Average ${feedback.ratingAverage.toFixed(1)} / 5. Structured responses only.`
              : view.dataSource === "preview"
                ? "No overall rating question is configured. Choice and written answers are reported separately."
                : "No overall rating question is configured. Choice answers are reported separately; written text is not exposed in the live report."
          }
        />
      </dl>

      <AnalyticsChartPanel
        title="Estimated interest trend"
        description="The weighted estimate over time. A pre-pledge amount never adds points to the ideathon score."
        legend="Estimated interest"
        points={points}
        tone="chain"
        summary={
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
            : "No estimated-interest history yet."
        }
        formatValue={(value) =>
          formatCompactMoney({
            atomic: String(Math.round(value)),
            currency: "USD",
            decimals: 2,
          })
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
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
        <AiInsightsPanel entitlement={entitlement} />
      </div>

      <section className="rounded-2xl border border-border bg-canvas p-4">
        <h2 className="text-sm font-bold text-ink">
          What feedback does and does not tell you
        </h2>
        <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted">
          A high rating means people found the idea promising in the context you
          described. It does not mean they would pay, switch tools, or back a
          campaign. Read the structured answers alongside the score, and treat
          the estimate as intent rather than revenue.
        </p>
      </section>
    </div>
  );
}
