import type { MetadataRoute } from "next";

import { absoluteUrl, siteOrigin } from "@/lib/seo/site";

/**
 * Route prefixes that must never appear in an index.
 *
 * Each is also gated by the server. Robots rules and `noindex` are discovery
 * hints at best, so they are an additional step here, never the only one.
 * `/og` is deliberately absent: search and social crawlers must be able to
 * fetch a share image for a page they are allowed to read.
 */
const PRIVATE_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
  "/d",
  "/onboarding",
  "/sign-out",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: "/",
        disallow: [...PRIVATE_PREFIXES],
        userAgent: "*",
      },
    ],
    host: new URL(siteOrigin()).host,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
