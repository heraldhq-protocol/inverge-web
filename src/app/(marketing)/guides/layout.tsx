import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * The listing page is a client component and cannot export metadata, so this
 * layout owns `/guides`. `/guides/[slug]` overrides it with its own.
 */
export const metadata: Metadata = buildPageMetadata({
  description:
    "Practical guides to validating ideas, backing campaigns, milestone review, refunds, and identity verification.",
  og: { eyebrow: "Guides", template: "marketing" },
  path: "/guides",
  title: "Guides",
});

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
