import { absoluteUrl } from "@/lib/seo/site";
import { sanitizeText } from "@/lib/seo/text";

/**
 * The share-image layouts. Each has a distinct reading order and emphasis, but
 * all share one palette, one logo mark, and one type scale.
 */
export const OG_TEMPLATES = [
  "creator",
  "default",
  "guide",
  "ideathon",
  "idea",
  "marketing",
] as const;

export type OgTemplate = (typeof OG_TEMPLATES)[number];

export function isOgTemplate(value: unknown): value is OgTemplate {
  return (
    typeof value === "string" &&
    (OG_TEMPLATES as readonly string[]).includes(value)
  );
}

/**
 * Falls back to the brand default rather than failing.
 *
 * An unknown template must never break a page's share image; the worst outcome
 * is a generic card.
 */
export function parseOgTemplate(value: string | null | undefined): OgTemplate {
  return isOgTemplate(value) ? value : "default";
}

/** Bounds applied before a value enters the URL, to keep it short and cacheable. */
const OG_LIMITS = {
  description: 160,
  eyebrow: 40,
  title: 96,
} as const;

export type OgImageInput = {
  description?: string | undefined;
  eyebrow?: string | undefined;
  template: OgTemplate;
  title: string;
};

/**
 * Builds the deterministic URL of a share image.
 *
 * The URL is derived only from the canonical origin and the sanitised fields,
 * so the same page always produces the same image address and an edge cache
 * can hold it. Nothing here reads the request.
 */
export function buildOgImageUrl(input: OgImageInput): string {
  const params = new URLSearchParams();

  params.set("template", input.template);
  params.set("title", sanitizeText(input.title, OG_LIMITS.title));

  if (input.description !== undefined) {
    const description = sanitizeText(input.description, OG_LIMITS.description);
    if (description !== "") params.set("description", description);
  }

  if (input.eyebrow !== undefined) {
    const eyebrow = sanitizeText(input.eyebrow, OG_LIMITS.eyebrow);
    if (eyebrow !== "") params.set("eyebrow", eyebrow);
  }

  return absoluteUrl(`/og?${params.toString()}`);
}
