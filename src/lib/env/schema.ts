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
  /**
   * Advertising switches. The flags module is authoritative for defaults; this
   * schema only keeps malformed deployment values from being silently treated
   * as "on".
   */
  /**
   * Product analytics is server-observed and off unless an operator opts in.
   * The secret is the same value the API verifies; a short value is a boot
   * error rather than a silently disabled producer.
   */
  INVERGE_ANALYTICS_ENABLED: z.enum(["true", "false"]).optional(),
  INVERGE_ANALYTICS_INGEST_SECRET: z.string().min(32).optional(),
  INVERGE_ADS_ENABLED: z.enum(["true", "false"]).optional(),
  INVERGE_ADS_THIRD_PARTY_ENABLED: z.enum(["true", "false"]).optional(),
  INVERGE_ADS_ANALYTICS_ENABLED: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED: z
    .enum(["true", "false"])
    .optional(),
  NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_INVERGE_ADSENSE_SLOT_ID: z.string().optional(),
});

export function parseEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  return environmentSchema.parse(environment);
}
