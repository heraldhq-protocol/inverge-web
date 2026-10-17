import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AnalyticsHeader } from "@/features/analytics/components/analytics-header";
import { AnalyticsTabs } from "@/features/analytics/components/analytics-tabs";
import { previewAnalytics } from "@/features/analytics/content/preview-analytics";

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
  const known = id === previewAnalytics.idea.id;

  return {
    title: known
      ? `Analytics for ${previewAnalytics.idea.title} | Inverge`
      : "Idea analytics | Inverge",
    description:
      "Private creator analytics for one idea: validation signals, support growth, feedback, and available next steps.",
  };
}

/**
 * Analytics is creator-only in the API and the route sits under the product
 * shell. This preview repository has no session yet, so the layout resolves the
 * one preview idea and returns 404 for anything else. When the typed client
 * lands, this lookup becomes the authenticated fetch and the API remains the
 * authority on ownership.
 */
export default async function AnalyticsLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  if (id !== previewAnalytics.idea.id) notFound();

  const basePath = `/d/creator/ideas/${id}/insights`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
      <AnalyticsHeader idea={previewAnalytics.idea} />

      <div className="mt-4">
        <Suspense
          fallback={<div className="h-11 border-b border-border" aria-hidden="true" />}
        >
          <AnalyticsTabs basePath={basePath} />
        </Suspense>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}
