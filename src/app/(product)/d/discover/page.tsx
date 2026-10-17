import type { Metadata } from "next";

import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { parseIdeaFilters } from "@/features/ideas/lib/filters";

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
  const params = await searchParams;

  return (
    <IdeasDashboard
      data={ideasPreviewData}
      initialState={parseIdeaFilters(params)}
      primaryAction={{ href: "/d/creator/ideas/new", label: "Create an idea" }}
      topics={previewTopics}
    />
  );
}
