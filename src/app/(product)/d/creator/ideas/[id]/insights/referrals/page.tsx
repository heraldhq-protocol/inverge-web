import type { Metadata } from "next";

import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { AnalyticsUnavailable } from "@/features/analytics/components/analytics-unavailable";

export const metadata: Metadata = {
  title: "Referrals | Idea analytics",
  description:
    "Referral attribution for one idea. Referrer and campaign parameters are not collected.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Referral attribution is deliberately not collected.
 *
 * The producer records a closed `pageKey` and a server-derived source; it never
 * stores a referrer URL, UTM string, or free-text campaign value. This page says
 * that plainly instead of presenting the acquisition source list as referral
 * performance. The traffic tab shows the source mix that does exist.
 */
export default async function ReferralsAnalyticsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
          Referrals
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink">
          Referral attribution is not collected
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          The analytics pipeline records a server-derived source and a closed
          page key. It does not store a referrer URL, UTM string, or free-text
          campaign value, so there is no referral report to show.
        </p>
      </div>

      <AnalyticsUnavailable
        icon={LinkSquare02Icon}
        title="No referral attribution"
        description="This is a privacy boundary, not a missing chart. Adding referrer or campaign tracking would require a privacy-policy change and a new consent surface before any data is collected."
        bullets={[
          "No referrer URL or UTM string is stored",
          "No cross-site history or fingerprint is built",
          "The traffic tab shows server-derived acquisition sources that do exist",
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/d/creator/ideas/${id}/insights/traffic`}
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Open traffic sources
        </Link>
        <Link
          href={`/d/creator/ideas/${id}/insights`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
