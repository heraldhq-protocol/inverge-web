import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AnalyticsHeader } from "@/features/analytics/components/analytics-header";
import {
  AnalyticsServiceUnavailable,
  AnalyticsSignedOut,
} from "@/features/analytics/components/analytics-state";
import { AnalyticsTabs } from "@/features/analytics/components/analytics-tabs";
import { getCreatorIdea } from "@/features/analytics/server/workspace";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getCreatorIdea(id);

  return {
    title:
      result.status === "live" || result.status === "preview"
        ? `Analytics for ${result.idea.title} | Inverge`
        : "Idea analytics | Inverge",
    description:
      "Private creator analytics for one idea: validation signals, support growth, feedback, and available next steps.",
  };
}

/**
 * The analytics shell resolves the idea before the page renders.
 *
 * Live auth reads the creator-only insights report as the ownership check, so a
 * signed-in reader who does not own the idea sees a 404, not a workspace header.
 * Preview auth resolves only the fixture idea. A signed-out reader gets an
 * explicit sign-in state rather than fixtures that look like their own data.
 */
export default async function AnalyticsLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  const result = await getCreatorIdea(id);
  if (result.status === "not_found") notFound();

  const basePath = `/d/creator/ideas/${id}/insights`;
  const containerClass =
    "mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10";

  if (result.status === "signed_out") {
    return (
      <div className={containerClass}>
        <AnalyticsSignedOut next={basePath} />
      </div>
    );
  }

  if (result.status === "unavailable") {
    return (
      <div className={containerClass}>
        <AnalyticsServiceUnavailable
          description={result.reason}
          retryHref={basePath}
        />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <AnalyticsHeader dataSource={result.status} idea={result.idea} />

      <div className="mt-4">
        <Suspense
          fallback={
            <div className="h-11 border-b border-border" aria-hidden="true" />
          }
        >
          <AnalyticsTabs basePath={basePath} />
        </Suspense>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}
