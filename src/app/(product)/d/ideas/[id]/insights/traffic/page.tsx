import type { Metadata } from "next";

import { EyeIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";
import { previewAnalytics } from "@/features/analytics/content/preview-analytics";

export const metadata: Metadata = {
  title: "Traffic | Idea analytics | Inverge",
  description: "Traffic analytics for one idea. View tracking is not connected yet.",
};

export default function TrafficAnalyticsPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
          Traffic
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink">
          Where readers come from
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Traffic is private creator analytics. It is never a validation metric
          and never appears as a public count on an idea.
        </p>
      </div>

      <AnalyticsUnavailable
        icon={EyeIcon}
        title="View tracking is not connected"
        description="The current analytics endpoint does not record idea views or referral sources, so there is no honest series to chart. This page will populate when the API records them."
        bullets={[
          "Views by surface: homepage, search, direct link, topic page",
          "Referral performance by source and campaign",
          "No view or impression figure is ever used to rank an idea",
        ]}
      />

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
          href={`/d/ideas/${previewAnalytics.idea.id}/insights`}
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to overview
        </Link>
        <Link
          href={`/ideas/${previewAnalytics.idea.id}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View public page
        </Link>
      </div>
    </div>
  );
}
