import type { Metadata } from "next";

import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { parseIdeaFilters } from "@/features/ideas/lib/filters";

export const metadata: Metadata = {
  title: "Discover ideas | Inverge",
  description:
    "Browse public validation signals for early-stage ideas from African builders.",
};

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
