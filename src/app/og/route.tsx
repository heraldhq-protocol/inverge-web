import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { parseOgTemplate } from "@/lib/seo/og-url";
import { siteOrigin } from "@/lib/seo/site";
import { sanitizeText } from "@/lib/seo/text";
import { loadOgFonts } from "@/features/seo/og/fonts";
import { OgImage } from "@/features/seo/og/templates";
import { OG_HEIGHT, OG_WIDTH } from "@/features/seo/og/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bounds applied again here, independently of the URL builder. A request can
 * reach this route without going through `buildOgImageUrl`, so the renderer
 * never trusts the query string it is handed.
 */
const LIMITS = {
  description: 160,
  eyebrow: 40,
  title: 96,
} as const;

const FALLBACK_TITLE = "Inverge";

/**
 * The URL of a share image encodes its own content, so a cached response can
 * never be paired with different text.
 */
const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

function renderProps(searchParams: URLSearchParams) {
  const title = sanitizeText(searchParams.get("title") ?? "", LIMITS.title);

  const description = sanitizeText(
    searchParams.get("description") ?? "",
    LIMITS.description,
  );

  const eyebrow = sanitizeText(
    searchParams.get("eyebrow") ?? "",
    LIMITS.eyebrow,
  );

  return {
    description: description === "" ? undefined : description,
    domain: new URL(siteOrigin()).host,
    eyebrow: eyebrow === "" ? undefined : eyebrow,
    template: parseOgTemplate(searchParams.get("template")),
    title: title === "" ? FALLBACK_TITLE : title,
  };
}

async function toImageResponse(props: ReturnType<typeof renderProps>) {
  return new ImageResponse(<OgImage {...props} />, {
    fonts: await loadOgFonts(),
    height: OG_HEIGHT,
    width: OG_WIDTH,
  });
}

/**
 * Renders a share image from sanitised query parameters.
 *
 * The card is drawn entirely from brand shapes and type: no remote image is
 * ever fetched on the way, so this route cannot be used to reach an internal
 * address on the deployment's behalf. Creator text is truncated and stripped
 * of control characters before it reaches the renderer.
 */
export async function GET(request: NextRequest) {
  const props = renderProps(request.nextUrl.searchParams);

  let image: ImageResponse;
  try {
    image = await toImageResponse(props);
  } catch {
    // A malformed input must never surface as a broken preview, so fall back
    // to a plain brand card carrying none of the supplied text.
    image = await toImageResponse(renderProps(new URLSearchParams()));
  }

  image.headers.set("Cache-Control", CACHE_CONTROL);

  return image;
}
