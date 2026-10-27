import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

import { MetricCard } from "@/components/ui/metric-card";
import { ActivityList } from "@/features/analytics/components/activity-list";
import { AnalyticsChartPanel } from "@/features/analytics/components/analytics-chart-panel";
import { AnalyticsPeriodSelect } from "@/features/analytics/components/analytics-period";
import {
  AnalyticsServiceUnavailable,
  AnalyticsSignedOut,
} from "@/features/analytics/components/analytics-state";
import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { TierBreakdown } from "@/features/analytics/components/tier-breakdown";
import {
  analyticsWindow,
  formatSeriesDate,
  parseAnalyticsPeriod,
} from "@/features/analytics/lib/analytics";
import { getIdeaAnalyticsWorkspace } from "@/features/analytics/server/workspace";

export const metadata: Metadata = {
  title: "Supporters | Idea analytics",
  description:
    "Support growth and the pre-pledge verification mix behind an idea.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SupportersAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const period = parseAnalyticsPeriod(query.period);
  const result = await getIdeaAnalyticsWorkspace(id, period);
  if (result.status === "not_found") notFound();
  if (result.status === "signed_out") {
    return (
      <AnalyticsSignedOut next={`/d/creator/ideas/${id}/insights/supporters`} />
    );
  }
  if (result.status === "unavailable") {
    return (
      <AnalyticsServiceUnavailable
        description={result.reason}
        retryHref={`/d/creator/ideas/${id}/insights/supporters`}
      />
    );
  }

  const view = result.view;
  const range = analyticsWindow(view.series, period);
  const first = range.points[0];
  const last = range.points[range.points.length - 1];
  const points = range.points.map((point) => ({
    date: point.date,
    value: point.supporters,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Supporters
          </p>
          <p className="mt-1 text-sm text-muted">
            Support is a behavioural signal. It is not a customer count, and
            supporter identities are never exposed here.
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
          label="Total supporters"
          icon={UserMultiple02Icon}
          value={view.summary.supporters.toLocaleString("en-US")}
          hint={
            view.idea.status === "draft"
              ? "All time. This draft is not public yet."
              : "All time. This is the same figure shown on the public idea page."
          }
        />
        <MetricCard
          label={`Net change, ${period} days`}
          value={
            range.supporterChange === null
              ? "No history"
              : `${range.supporterChange >= 0 ? "+" : ""}${range.supporterChange.toLocaleString("en-US")}`
          }
          hint={
            range.hasComparison && range.previousSupporterChange !== null
              ? `Previous ${period} days: ${range.previousSupporterChange >= 0 ? "+" : ""}${range.previousSupporterChange.toLocaleString("en-US")}`
              : "Not enough history for a previous period yet."
          }
        />
        <MetricCard
          label="Pre-pledges recorded"
          icon={CheckmarkBadge01Icon}
          value={
            view.summary.prePledges === null
              ? "Not measured"
              : view.summary.prePledges.toLocaleString("en-US")
          }
          unavailable={
            view.summary.prePledges === null
              ? "The preview fixture does not include a pre-pledge count."
              : undefined
          }
          hint="Current total, not limited to the selected period. A pre-pledge is intent, never a payment."
        />
      </dl>

      <AnalyticsChartPanel
        title="Supporter growth"
        description={
          view.idea.status === "draft"
            ? "Cumulative supporters since the idea was created. The line never counts a repeated support from the same account twice."
            : "Cumulative supporters since publication. The line never counts a repeated support from the same account twice."
        }
        legend="Supporters"
        points={points}
        summary={
          first && last
            ? `Supporter growth from ${first.supporters} on ${formatSeriesDate(first.date, true)} to ${last.supporters} on ${formatSeriesDate(last.date, true)}.`
            : "No supporter history yet."
        }
        formatValue={(value) => Math.round(value).toLocaleString("en-US")}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <TierBreakdown tiers={view.tiers} />
        <AnalyticsUnavailable
          icon={UserMultiple02Icon}
          title="Supporter identities"
          description="Individual supporter names are not shown in creator analytics. Aggregate counts are enough to understand momentum without exposing who supported an idea."
        />
      </div>

      <ActivityList activity={view.activity} dataSource={view.dataSource} />

      <p className="text-[0.6875rem] leading-4 text-muted">
        <HugeiconsIcon
          icon={UserMultiple02Icon}
          size={12}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mr-1 inline align-[-1px]"
        />
        {view.dataSource === "live"
          ? "The verification mix comes from the API's weighted pre-pledge report. It is not a client-side calculation, and it does not expose supporter identities."
          : "Verification mix is preview data. In the API, it comes from the weighted pre-pledge report, never from a client-side calculation."}
      </p>
    </div>
  );
}
