import type { Metadata } from "next";
import { connection } from "next/server";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { parseIdeaFilters } from "@/features/ideas/lib/filters";
import { getIdeasDiscoveryView } from "@/features/ideas/server/views";

export const metadata: Metadata = {
  title: "Discover ideas",
  description:
    "Explore early-stage ideas gathering support, feedback, and pre-pledge intent on Inverge.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * In-shell discovery.
 *
 * `/ideas` remains the public, indexable catalogue; this route exists so a
 * signed-in reader never loses the product shell while browsing. It renders the
 * same catalogue component, so filters, sorting, and pagination behave
 * identically on both surfaces.
 */
export default async function DiscoverPage({ searchParams }: PageProps) {
  const [params] = await Promise.all([searchParams, connection()]);

  // Preview auth is a local UI mode, so it deliberately keeps the fixture
  // catalogue even when an API is configured. A real session reads the live
  // public catalogue through the same server seam as `/ideas`.
  const view = isPreviewAuth()
    ? {
        data: ideasPreviewData,
        dataSource: "preview" as const,
        topics: previewTopics,
        truncated: false,
      }
    : await getIdeasDiscoveryView();

  return (
    <IdeasDashboard
      data={view.data}
      dataSource={view.dataSource}
      initialState={parseIdeaFilters(params)}
      primaryAction={{ href: "/d/creator/ideas/new", label: "Create an idea" }}
      topics={view.topics}
      truncated={view.truncated}
    />
  );
}
