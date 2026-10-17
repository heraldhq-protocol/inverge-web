import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { EditorialArticle } from "@/features/marketing/components/editorial-article";
import {
  findEditorialEntry,
  journalEntries,
} from "@/features/marketing/content/editorial";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journalEntries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEditorialEntry(journalEntries, slug);
  if (!entry) return {};

  return buildPageMetadata({
    description: entry.summary,
    og: {
      alt: `${entry.title} — from the Inverge journal`,
      eyebrow: "Journal",
      template: "guide",
    },
    path: `/blog/${entry.slug}`,
    title: entry.title,
  });
}

export default async function JournalEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = findEditorialEntry(journalEntries, slug);
  if (!entry) notFound();

  return (
    <>
      <JsonLd
        data={[
          // As with the guides, no date is claimed because the content records
          // none.
          articleJsonLd({
            description: entry.summary,
            path: `/blog/${entry.slug}`,
            title: entry.title,
            type: "BlogPosting",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/blog" },
            { name: entry.title, path: `/blog/${entry.slug}` },
          ]),
        ]}
      />
      <EditorialArticle entry={entry} />
    </>
  );
}
