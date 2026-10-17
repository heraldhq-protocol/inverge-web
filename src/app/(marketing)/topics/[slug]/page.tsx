import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { TopicCatalog } from "@/features/ideas/components/topic-catalog";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { ideasInTopic } from "@/features/ideas/lib/filter-ideas";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewTopics } from "@/features/ideas/content/topics";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return previewTopics.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = previewTopics.find((entry) => entry.slug === slug);
  if (!topic) return {};

  return buildPageMetadata({
    description: topic.description,
    og: { eyebrow: "Topic", template: "marketing" },
    path: `/topics/${topic.slug}`,
    title: topic.title,
  });
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = previewTopics.find((entry) => entry.slug === slug);
  if (!topic) notFound();

  const ideas = ideasInTopic(topic, allPublicIdeas(ideasPreviewData), "public");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Ideas", path: "/ideas" },
          { name: topic.title, path: `/topics/${topic.slug}` },
        ])}
      />
      <TopicCatalog ideas={ideas} topic={topic} topics={previewTopics} />
    </>
  );
}
