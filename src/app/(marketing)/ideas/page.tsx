import type { Metadata } from "next";

import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { parseIdeaFilters } from "@/features/ideas/lib/filters";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Browse public validation signals for early-stage ideas from African builders.",
  og: { eyebrow: "Ideas", template: "marketing" },
  path: "/ideas",
  title: "Discover ideas",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IdeasPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <IdeasDashboard
      data={ideasPreviewData}
      initialState={parseIdeaFilters(params)}
      topics={previewTopics}
      viewer="visitor"
    />
  );
}
