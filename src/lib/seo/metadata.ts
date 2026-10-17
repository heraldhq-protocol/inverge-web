import type { Metadata } from "next";

import { buildOgImageUrl, type OgTemplate } from "@/lib/seo/og-url";
import {
  absoluteUrl,
  SITE_LOCALE,
  SITE_NAME,
  twitterSiteHandle,
} from "@/lib/seo/site";

/**
 * Indexation for a page.
 *
 * `noindex` is the only other option on purpose. Robots directives are a
 * ranking signal at most, never an access control, so private surfaces are
 * gated by the server and marked `noindex` as a second, independent step.
 */
export type PageRobots = "all" | "noindex";

export type PageMetadataInput = {
  description: string;
  /** Site-relative canonical path, e.g. `/ideas/farmlink-coldbox`. */
  path: string;
  /** ISO timestamps. Only set for genuinely dated editorial content. */
  publishedAt?: string | undefined;
  modifiedAt?: string | undefined;
  og?:
    | {
        /** Describes the image itself, not the page. Defaults to the title. */
        alt?: string | undefined;
        eyebrow?: string | undefined;
        template?: OgTemplate | undefined;
      }
    | undefined;
  robots?: PageRobots | undefined;
  title: string;
};

/**
 * Builds a complete `Metadata` object for one page.
 *
 * Every public page routes through this so the canonical URL, the share image,
 * and the robots policy come from one place and cannot drift apart. The title
 * is the bare page title: the root layout's template appends the site name.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { description, title } = input;

  const url = absoluteUrl(input.path);
  const template = input.og?.template ?? "default";
  const imageAlt = input.og?.alt ?? title;

  const ogImageUrl = buildOgImageUrl({
    description,
    eyebrow: input.og?.eyebrow,
    template,
    title,
  });

  const isArticle = input.publishedAt !== undefined;

  const openGraph: Metadata["openGraph"] = {
    description,
    images: [{ alt: imageAlt, height: 630, url: ogImageUrl, width: 1200 }],
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title,
    type: isArticle ? "article" : "website",
    url,
    ...(isArticle ? { publishedTime: input.publishedAt } : {}),
    ...(input.modifiedAt !== undefined
      ? { modifiedTime: input.modifiedAt }
      : {}),
  };

  const twitterHandle = twitterSiteHandle();

  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    description,
    images: [{ alt: imageAlt, url: ogImageUrl }],
    title,
    ...(twitterHandle !== null ? { site: twitterHandle } : {}),
  };

  return {
    alternates: { canonical: url },
    description,
    openGraph,
    robots:
      input.robots === "noindex"
        ? { follow: false, index: false }
        : { follow: true, index: true },
    title,
    twitter,
  };
}

/**
 * The robots policy for a private surface: excluded from the index and from
 * crawling, while the route itself stays protected by the server.
 */
export const PRIVATE_ROBOTS: NonNullable<Metadata["robots"]> = {
  follow: false,
  index: false,
};
