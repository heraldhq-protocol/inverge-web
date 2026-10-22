import type { Metadata } from "next";

import { ChartLineData02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { previewAnalytics } from "@/features/analytics/content/preview-analytics";

export const metadata: Metadata = {
  title: "Referrals | Idea analytics",
  description:
    "Referral performance for one idea. Referral tracking is not connected yet.",
};

export default function ReferralsAnalyticsPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
          Referrals
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink">
          Which communities bring readers
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Referral data would show which link, community, or creator brought
          someone to the idea. It is not connected yet.
        </p>
      </div>

      <AnalyticsUnavailable
        icon={ChartLineData02Icon}
        title="Referral tracking is not connected"
        description="No referral attribution is recorded by the current API. This page explains the gap rather than showing an invented distribution."
        bullets={[
          "Shares by creator, community, or partner link",
          "Views and support conversion per source",
          "The same view privacy rule as Traffic: no public counts",
        ]}
      />

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-sm font-bold text-ink">What is measured today</h3>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          You can still see the signals that matter most: support growth,
          estimated interest, structured feedback, and the launch-threshold
          progress on the overview. Those figures are not dependent on referral
          attribution.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/d/creator/ideas/${previewAnalytics.idea.id}/insights`}
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to overview
        </Link>
        <Link
          href={`/d/creator/ideas/${previewAnalytics.idea.id}/insights/supporters`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View supporter growth
        </Link>
      </div>
    </div>
  );
}
