import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditorialArticle } from "@/features/marketing/components/editorial-article";
import {
  findEditorialEntry,
  journalEntries,
} from "@/features/marketing/content/editorial";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journalEntries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEditorialEntry(journalEntries, slug);
  return entry
    ? { title: `${entry.title} — Inverge`, description: entry.summary }
    : {};
}

export default async function JournalEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = findEditorialEntry(journalEntries, slug);
  if (!entry) notFound();
  return <EditorialArticle entry={entry} />;
}
