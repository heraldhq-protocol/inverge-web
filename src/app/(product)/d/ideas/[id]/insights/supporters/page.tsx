import type { Metadata } from "next";
import { Suspense } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

import { MetricCard } from "@/components/ui/metric-card";
import { ActivityList } from "@/features/analytics/components/activity-list";
import { AnalyticsChartPanel } from "@/features/analytics/components/analytics-chart-panel";
import { AnalyticsPeriodSelect } from "@/features/analytics/components/analytics-period";
import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { TierBreakdown } from "@/features/analytics/components/tier-breakdown";
import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import {
  analyticsWindow,
  formatSeriesDate,
  parseAnalyticsPeriod,
} from "@/features/analytics/lib/analytics";

export const metadata: Metadata = {
  title: "Supporters | Idea analytics",
  description: "Support growth and the verification mix behind an idea's supporters.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SupportersAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = parseAnalyticsPeriod(params.period);
  const range = analyticsWindow(previewAnalytics.series, period);
  const first = range.points[0];
  const last = range.points[range.points.length - 1];
  const points = range.points.map((point) => ({
    date: point.date,
    value: point.supporters,
  }));
  const verified =
    previewAnalytics.supportersByTier.find(
      (tier) => tier.tier === "Identity verified",
    )?.count ?? 0;

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
          value={previewAnalytics.idea.supporters.toLocaleString("en-US")}
          hint="All time. This is the same figure shown on the public idea page."
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
          label="Identity verified"
          icon={CheckmarkBadge01Icon}
          value={verified.toLocaleString("en-US")}
          hint="Verified accounts carry a 1.0 ideathon weight. Email-only accounts carry 0.25."
        />
      </dl>

      <AnalyticsChartPanel
        title="Supporter growth"
        description="Cumulative supporters since publication. The line never counts a repeated support from the same account twice."
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
        <TierBreakdown tiers={previewAnalytics.supportersByTier} />
        <AnalyticsUnavailable
          icon={UserMultiple02Icon}
          title="Supporter identities"
          description="Individual supporter names are not shown in creator analytics. Aggregate counts are enough to understand momentum without exposing who supported an idea."
        />
      </div>

      <ActivityList activity={previewAnalytics.activity} />

      <p className="text-[0.6875rem] leading-4 text-muted">
        <HugeiconsIcon
          icon={UserMultiple02Icon}
          size={12}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mr-1 inline align-[-1px]"
        />
        Verification mix is preview data. In the API, it comes from the weighted
        tier breakdown, never from a client-side calculation.
      </p>
    </div>
  );
}
