import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TopicCatalog } from "@/features/ideas/components/topic-catalog";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { ideasInTopic } from "@/features/ideas/lib/filter-ideas";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return previewTopics.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = previewTopics.find((entry) => entry.slug === slug);

  return topic
    ? {
        title: `${topic.title} — Inverge`,
        description: topic.description,
      }
    : {};
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = previewTopics.find((entry) => entry.slug === slug);
  if (!topic) notFound();

  const ideas = ideasInTopic(topic, allPublicIdeas(ideasPreviewData), "public");

  return <TopicCatalog ideas={ideas} topic={topic} topics={previewTopics} />;
}
