import { buildOgImageUrl } from "@/lib/seo/og-url";
import {
  absoluteUrl,
  SITE_DEFAULT_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
} from "@/lib/seo/site";

/**
 * An open-shaped JSON-LD node.
 *
 * schema.org is deliberately loose, so the shapes below are built as plain
 * records rather than a rigid local type that would have to be widened the
 * moment a new `@type` appears.
 */
export type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_REF = { "@type": "Organization", name: SITE_NAME };

/**
 * The organisation behind the platform.
 *
 * No social profiles, ratings, or aggregate figures are asserted: only
 * identity, description, and the canonical home URL, all of which are true
 * today.
 */
export function organizationJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    description: SITE_DEFAULT_DESCRIPTION,
    logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
    name: SITE_NAME,
    url: absoluteUrl("/"),
  };
}

/** The site as a whole, owned by the organisation above. */
export function websiteJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: SITE_DEFAULT_DESCRIPTION,
    inLanguage: SITE_LOCALE,
    name: SITE_NAME,
    publisher: ORGANIZATION_REF,
    url: absoluteUrl("/"),
  };
}

export type BreadcrumbItem = {
  name: string;
  /** Site-relative path. */
  path: string;
};

/**
 * A breadcrumb trail. Positions are 1-based, per schema.org.
 */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export type ArticleJsonLdInput = {
  description: string;
  /** Only set for genuinely dated editorial content. */
  modifiedAt?: string | undefined;
  path: string;
  publishedAt?: string | undefined;
  title: string;
  /** `Article` by default; `BlogPosting` for the journal. */
  type?: "Article" | "BlogPosting" | undefined;
};

/**
 * Editorial long-form content.
 *
 * Bylines are attributed to the organisation, which is accurate for Inverge's
 * own guides and journal. No rating, word count, or reader count is claimed.
 */
export function articleJsonLd(input: ArticleJsonLdInput): JsonLdNode {
  const url = absoluteUrl(input.path);

  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "Article",
    author: ORGANIZATION_REF,
    description: input.description,
    headline: input.title,
    image: [
      buildOgImageUrl({
        description: input.description,
        eyebrow: input.type === "BlogPosting" ? "Journal" : "Guide",
        template: "guide",
        title: input.title,
      }),
    ],
    inLanguage: SITE_LOCALE,
    mainEntityOfPage: url,
    // Both dates are omitted unless genuinely known. A made-up publication
    // date is a false claim, not a placeholder.
    ...(input.publishedAt !== undefined
      ? { datePublished: input.publishedAt }
      : {}),
    ...(input.modifiedAt !== undefined
      ? { dateModified: input.modifiedAt }
      : {}),
    publisher: {
      "@type": "Organization",
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
      name: SITE_NAME,
    },
    url,
  };
}
