import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IdeaDetail } from "@/features/ideas/components/idea-detail";
import { allPublicIdeas, findIdeaById } from "@/features/ideas/lib/catalog";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return allPublicIdeas(ideasPreviewData).map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idea = findIdeaById(ideasPreviewData, id);

  return idea
    ? {
        title: `${idea.title} — Inverge`,
        description: idea.description,
      }
    : {};
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const idea = getPreviewIdeaDetail(id);
  if (!idea) notFound();

  return (
    <IdeaDetail
      idea={idea}
      ideas={allPublicIdeas(ideasPreviewData)}
      topics={previewTopics}
    />
  );
}
