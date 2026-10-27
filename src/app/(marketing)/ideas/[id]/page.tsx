import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { JsonLd } from "@/components/shared/json-ld";
import { IdeaDetail } from "@/features/ideas/components/idea-detail";
import { getIdeaDetailView } from "@/features/ideas/server/views";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  // The same merged record the page renders, so a title and description can
  // never describe an idea other than the one on screen.
  const view = await getIdeaDetailView(id);
  if (!view) return {};
  const { idea } = view;

  return buildPageMetadata({
    description: idea.description,
    og: {
      alt: `${idea.title} — an idea on Inverge`,
      eyebrow: "Idea",
      template: "idea",
    },
    path: `/ideas/${idea.id}`,
    // An unlisted idea stays readable to anyone holding the link, but must not
    // be discoverable through search.
    robots: idea.visibility === "public" ? "all" : "noindex",
    title: idea.title,
  });
}

export default async function IdeaDetailPage({ params }: PageProps) {
  await connection();

  const { id } = await params;
  const view = await getIdeaDetailView(id);
  if (!view) notFound();

  const { idea } = view;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Ideas", path: "/ideas" },
          { name: idea.title, path: `/ideas/${idea.id}` },
        ])}
      />
      <IdeaDetail
        comments={view.comments}
        commentsState={view.commentsState}
        dataSource={view.dataSource}
        idea={idea}
        ideas={view.ideas}
        topics={view.topics}
      />
    </>
  );
}
