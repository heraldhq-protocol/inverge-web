import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { IdeaDetail } from "@/features/ideas/components/idea-detail";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return allPublicIdeas(ideasPreviewData).map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  // The same merged record the page renders, so a title and description can
  // never describe an idea other than the one on screen.
  const idea = getPreviewIdeaDetail(id);
  if (!idea) return {};

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
  const { id } = await params;
  const idea = getPreviewIdeaDetail(id);
  if (!idea) notFound();

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
        idea={idea}
        ideas={allPublicIdeas(ideasPreviewData)}
        topics={previewTopics}
      />
    </>
  );
}
