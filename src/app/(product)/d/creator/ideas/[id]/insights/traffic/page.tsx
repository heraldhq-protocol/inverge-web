import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { EyeIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { MetricCard } from "@/components/ui/metric-card";
import { AcquisitionPanel } from "@/features/analytics/components/acquisition-panel";
import { AnalyticsChartPanel } from "@/features/analytics/components/analytics-chart-panel";
import { AnalyticsPeriodSelect } from "@/features/analytics/components/analytics-period";
import {
  AnalyticsServiceUnavailable,
  AnalyticsSignedOut,
} from "@/features/analytics/components/analytics-state";
import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { GeographyPanel } from "@/features/analytics/components/geography-panel";
import { PremiumAccessPanel } from "@/features/analytics/components/premium-access-panel";
import {
  formatSeriesDate,
  parseAnalyticsPeriod,
} from "@/features/analytics/lib/analytics";
import { getAnalyticsAccess } from "@/features/analytics/server/access";
import { getIdeaAnalyticsWorkspace } from "@/features/analytics/server/workspace";

export const metadata: Metadata = {
  title: "Traffic | Idea analytics",
  description: "Private view, acquisition, and country analytics for one idea.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrafficAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const period = parseAnalyticsPeriod(query.period);
  const [result, access] = await Promise.all([
    getIdeaAnalyticsWorkspace(id, period, { includeTraffic: true }),
    getAnalyticsAccess(),
  ]);
  if (result.status === "not_found") notFound();
  if (result.status === "signed_out") {
    return (
      <AnalyticsSignedOut next={`/d/creator/ideas/${id}/insights/traffic`} />
    );
  }
  if (result.status === "unavailable") {
    return (
      <AnalyticsServiceUnavailable
        description={result.reason}
        retryHref={`/d/creator/ideas/${id}/insights/traffic`}
      />
    );
  }

  const view = result.view;
  const views = view.summary.views;
  const uniqueSessions = view.summary.uniqueSessions;
  const viewPoints = view.viewSeries.map((point) => ({
    date: point.date,
    value: point.views,
  }));
  const premium = view.premium;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Traffic
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink">
            Where readers come from
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Traffic is private creator analytics. It is never a validation
            metric and never appears as a public count on an idea.
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
          label="Idea views"
          icon={EyeIcon}
          value={
            views === null ? "Not measured" : views.toLocaleString("en-US")
          }
          unavailable={
            views === null
              ? "View tracking is not available in this workspace yet."
              : undefined
          }
          hint={
            views === null
              ? undefined
              : `Views in the selected ${period}-day period.`
          }
        />
        <MetricCard
          label="Unique sessions"
          icon={UserMultiple02Icon}
          value={
            uniqueSessions === null
              ? "Not measured"
              : uniqueSessions.toLocaleString("en-US")
          }
          unavailable={
            uniqueSessions === null
              ? "Unique sessions are not available in this workspace yet."
              : undefined
          }
          hint={
            uniqueSessions === null
              ? undefined
              : view.summary.uniqueSessionsExact
                ? "Exact within the raw-event retention window."
                : "Estimated by summing daily uniques; the exact value is outside raw retention."
          }
        />
        <MetricCard
          label="Last aggregated day"
          value={
            view.summary.lastAggregatedDay === null
              ? "Not yet"
              : formatSeriesDate(view.summary.lastAggregatedDay, true)
          }
          hint="Daily aggregates run in UTC. Today may still be collecting."
        />
      </dl>

      {views === null ? (
        <AnalyticsUnavailable
          icon={EyeIcon}
          title={
            view.dataSource === "preview"
              ? "View tracking is not connected"
              : "View tracking is unavailable"
          }
          description={
            view.dataSource === "preview"
              ? "The preview fixtures never contained view data, so there is no honest series to chart. Live workspaces load the daily view series from the analytics API."
              : "The analytics API did not return a view series for this period."
          }
          bullets={[
            "Server-derived source mix: feed, search, direct, and internal links",
            "Country-level distribution with a privacy threshold",
            "No view or impression figure is ever used to rank an idea",
          ]}
        />
      ) : (
        <AnalyticsChartPanel
          title="Daily views"
          description="Private page views for this idea. A view is counted once per visitor session per day."
          legend="Views"
          points={viewPoints}
          summary={`${views.toLocaleString("en-US")} views in the selected ${period}-day period.`}
          formatValue={(value) => Math.round(value).toLocaleString("en-US")}
        />
      )}

      {premium ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {view.acquisition ? (
            <AcquisitionPanel acquisition={view.acquisition} />
          ) : (
            <AnalyticsUnavailable
              icon={EyeIcon}
              title="Traffic sources are unavailable"
              description="Premium access is active, but the acquisition report did not load. Try again in a moment."
            />
          )}
          {view.geography ? (
            <GeographyPanel geography={view.geography} />
          ) : (
            <AnalyticsUnavailable
              icon={EyeIcon}
              title="Country breakdown is unavailable"
              description="Premium access is active, but the geography report did not load. Try again in a moment."
            />
          )}
        </div>
      ) : (
        <PremiumAccessPanel access={access} notice={null} />
      )}

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-sm font-bold text-ink">Why this is separate</h3>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          Views measure attention, not validation. Publishing view counts would
          reward promotion over a real community response, which is why the
          public page and the ideathon deliberately do not use them.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/d/creator/ideas/${view.idea.id}/insights`}
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to overview
        </Link>
        <Link
          href={
            view.idea.status === "draft"
              ? `/d/creator/ideas/${view.idea.id}`
              : `/ideas/${view.idea.id}`
          }
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {view.idea.status === "draft"
            ? "Open idea editor"
            : "View public page"}
        </Link>
      </div>
    </div>
  );
}
