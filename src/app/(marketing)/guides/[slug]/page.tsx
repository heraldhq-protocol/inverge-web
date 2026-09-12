import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideArticle } from "@/features/marketing/components/guide-article";
import {
  findEditorialEntry,
  guides,
} from "@/features/marketing/content/editorial";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = findEditorialEntry(guides, slug);
  return guide
    ? { title: `${guide.title} — Inverge`, description: guide.summary }
    : {};
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = findEditorialEntry(guides, slug);
  if (!guide) notFound();
  return <GuideArticle entry={guide} />;
}
