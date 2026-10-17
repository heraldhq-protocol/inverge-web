import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/shared/json-ld";
import { GuideArticle } from "@/features/marketing/components/guide-article";
import {
  findEditorialEntry,
  guides,
} from "@/features/marketing/content/editorial";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = findEditorialEntry(guides, slug);
  if (!guide) return {};

  return buildPageMetadata({
    description: guide.summary,
    og: {
      alt: `${guide.title} — a guide on Inverge`,
      eyebrow: "Guide",
      template: "guide",
    },
    path: `/guides/${guide.slug}`,
    title: guide.title,
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = findEditorialEntry(guides, slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd
        data={[
          // No publication date is asserted: the fixture records none, and a
          // made-up date would be a false claim to every crawler.
          articleJsonLd({
            description: guide.summary,
            path: `/guides/${guide.slug}`,
            title: guide.title,
            type: "Article",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
        ]}
      />
      <GuideArticle entry={guide} />
    </>
  );
}
