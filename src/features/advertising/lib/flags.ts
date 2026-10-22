import type { AdFlags } from "@/features/advertising/types";

/**
 * Advertising feature flags.
 *
 * The master switch defaults on only in local development so reviewers can see
 * the labelled inventory. Production stays off until a deployment explicitly
 * enables it. Third-party advertising needs both its own switch and a public
 * AdSense client id, so copying one env file cannot switch on a vendor by
 * accident.
 */
export function resolveAdFlags(
  env: Readonly<Record<string, string | undefined>> = process.env,
): AdFlags {
  const explicit = env.INVERGE_ADS_ENABLED?.trim().toLowerCase();
  const enabled =
    explicit === "true"
      ? true
      : explicit === "false"
        ? false
        : env.NODE_ENV === "development";

  const hasClientId = Boolean(
    env.NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID?.trim(),
  );

  return {
    enabled,
    thirdPartyEnabled:
      enabled &&
      env.INVERGE_ADS_THIRD_PARTY_ENABLED?.trim().toLowerCase() === "true" &&
      hasClientId,
  };
}

/**
 * The event route is independent of inventory: first-party impressions still
 * require an explicit opt-in because no analytics sink exists yet.
 */
export function advertisingAnalyticsEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return env.INVERGE_ADS_ANALYTICS_ENABLED?.trim().toLowerCase() === "true";
}
