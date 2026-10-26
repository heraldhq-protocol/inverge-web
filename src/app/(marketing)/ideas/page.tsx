import type { Metadata } from "next";
import { connection } from "next/server";

import { AdSlot } from "@/features/advertising/components/ad-slot";
import { recordPageView } from "@/features/analytics/server/ingest";
import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { parseIdeaFilters } from "@/features/ideas/lib/filters";
import { getIdeasDiscoveryView } from "@/features/ideas/server/views";
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
  // Discovery reads the live API, so it must render per request rather than
  // capture whatever the API held during `next build`.
  await connection();
  recordPageView("ideas");

  const [params, view] = await Promise.all([
    searchParams,
    getIdeasDiscoveryView(),
  ]);
  const publicIdeaCount = view.data.featured.length + view.data.ideas.length;

  return (
    <IdeasDashboard
      data={view.data}
      dataSource={view.dataSource}
      initialState={parseIdeaFilters(params)}
      sponsoredSlot={
        view.dataSource === "preview" ? (
          <AdSlot
            page={{ kind: "ideas", organicResultCount: publicIdeaCount }}
            placementId="idea-feed-inline"
          />
        ) : undefined
      }
      topics={view.topics}
      truncated={view.truncated}
      viewer="visitor"
    />
  );
}
