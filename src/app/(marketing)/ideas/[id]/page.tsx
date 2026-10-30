import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { JsonLd } from "@/components/shared/json-ld";
import {
  parseAnalyticsSource,
  recordIdeaView,
  recordPageView,
} from "@/features/analytics/server/ingest";
import { IdeaDetail } from "@/features/ideas/components/idea-detail";
import { getIdeaDetailView } from "@/features/ideas/server/views";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function ideaPath(idea: { id: string; slug?: string | undefined }): string {
  return `/ideas/${encodeURIComponent(idea.slug ?? idea.id)}`;
}

function queryString(
  query: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  // The same merged record the page renders, so a title and description can
  // never describe an idea other than the one on screen.
  const view = await getIdeaDetailView(id);
  // Resolve in metadata so a missing or hidden idea never produces metadata for
  // a record the page will not render. The API remains the access boundary.
  if (!view) notFound();
  const { idea } = view;

  return buildPageMetadata({
    description: idea.description,
    og: {
      alt: `${idea.title} — an idea on Inverge`,
      eyebrow: "Idea",
      template: "idea",
    },
    path: ideaPath(idea),
    // An unlisted idea stays readable to anyone holding the link, but must not
    // be discoverable through search.
    robots: idea.visibility === "public" ? "all" : "noindex",
    title: idea.title,
  });
}

export default async function IdeaDetailPage({
  params,
  searchParams,
}: PageProps) {
  await connection();

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const view = await getIdeaDetailView(id);
  if (!view) notFound();

  const { idea } = view;
  const canonical = ideaPath(idea);
  // Shared links used to be the internal id. Redirect once to the slug so the
  // address bar, copy-link, social share, and canonical metadata agree.
  if (id !== (idea.slug ?? idea.id)) {
    redirect(`${canonical}${queryString(query)}`);
  }

  const source = parseAnalyticsSource(query.source);
  recordPageView("idea-detail", { source });
  recordIdeaView(idea.id, { source });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Ideas", path: "/ideas" },
          { name: idea.title, path: canonical },
        ])}
      />
      <IdeaDetail
        comments={view.comments}
        commentsState={view.commentsState}
        dataSource={view.dataSource}
        idea={idea}
        ideas={view.ideas}
        signals={view.signals}
        topics={view.topics}
        viewer={view.viewer}
      />
    </>
  );
}
