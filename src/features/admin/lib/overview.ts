import { z } from "zod";

const count = z.number().int().nonnegative();
const timestamp = z.iso.datetime({ offset: true });

/** The public summary contains counts, never funding or backer totals. */
export const platformSummarySchema = z.object({
  asOf: timestamp,
  publishedIdeas: count,
  activeCampaigns: count,
  completedCampaigns: count,
  totalCampaigns: count,
});

// FR-801–803: validate monetary strings without coercion or rounding. The
// backend contract is getPlatformEscrowStats(), documented in ADMIN_WORKSPACE.
const usd = z
  .string()
  .max(100)
  .regex(/^\d+(?:\.\d{1,2})?$/);
export const platformEscrowSchema = z.object({
  asOf: timestamp,
  heldUsd: usd,
  releasedUsd: usd,
  refundedUsd: usd,
  counts: z.object({ active: count, completed: count, refunded: count }),
});

export const adminAnalyticsSchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  generatedAt: timestamp,
  lastAggregatedDay: z.iso.date().nullable(),
  totals: z.object({
    views: count,
    uniqueSessions: count,
    uniqueSessionsExact: z.boolean(),
  }),
  resources: z
    .array(
      z.object({
        resourceType: z.enum(["IDEA", "CAMPAIGN", "PAGE"]),
        views: count,
        uniqueSessions: count,
      }),
    )
    .max(3)
    .refine(
      (rows) =>
        new Set(rows.map((row) => row.resourceType)).size === rows.length,
      "Resource groups must be unique.",
    ),
});

export type PlatformSummary = z.infer<typeof platformSummarySchema>;
export type PlatformEscrow = z.infer<typeof platformEscrowSchema>;
export type AdminAnalytics = z.infer<typeof adminAnalyticsSchema>;

export type OverviewSection<T> =
  { status: "ready"; data: T } | { status: "unavailable"; reason: string };

export const OVERVIEW_PERIODS = [7, 30, 90] as const;
export type OverviewPeriod = (typeof OVERVIEW_PERIODS)[number];

export function overviewPeriod(
  value: string | string[] | undefined,
): OverviewPeriod {
  return value === "7" ? 7 : value === "90" ? 90 : 30;
}

export function overviewRange(period: OverviewPeriod, now: Date) {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - period + 1);
  return {
    from: start.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
}

export type AdminOverviewData = {
  summary: OverviewSection<PlatformSummary>;
  escrow: OverviewSection<PlatformEscrow>;
  analytics: OverviewSection<AdminAnalytics>;
  period: OverviewPeriod;
  range: { from: string; to: string };
  readAt: string;
};

/** Preserve every cent, including amounts beyond Number.MAX_SAFE_INTEGER. */
export function formatEscrowUsd(value: string): string {
  const [whole = "0", fraction = ""] = usd.parse(value).split(".");
  return `$${BigInt(whole).toLocaleString("en-US")}.${fraction.padEnd(2, "0")}`;
}

export function overviewTimestamp(value: string): string {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value)) + " UTC"
  );
}
