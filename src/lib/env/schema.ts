import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  /**
   * Canonical public origin, e.g. `https://inverge.africa`.
   *
   * Everything that builds a canonical or share URL reads this rather than a
   * request, so the same page always claims one address regardless of which
   * deployment served it. Optional, but a production build without it falls
   * back to the documented default in `src/lib/seo/site.ts`.
   */
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  /** Displayed X/Twitter handle. Omitted from share tags when unset. */
  NEXT_PUBLIC_TWITTER_HANDLE: z.string().optional(),
});

export function parseEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  return environmentSchema.parse(environment);
}
