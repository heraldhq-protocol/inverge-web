import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Explore Inverge ideathon programmes, the published ranking rules, and the frozen results of past editions.",
  og: { eyebrow: "Ideathon", template: "ideathon" },
  path: "/ideathon",
  title: "Ideathon",
});

/**
 * The route group keeps metadata together; each page owns its own hero and
 * section navigation because a detail page has a different information
 * architecture from the catalogue.
 */
export default function IdeathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
