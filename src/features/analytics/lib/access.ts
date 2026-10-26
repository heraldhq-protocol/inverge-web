import { z } from "zod";

/**
 * The API's premium-analytics access projection.
 *
 * This is intentionally a narrow schema: the dashboard renders a status and a
 * request button, not a plan, a price, or a billing promise. Unknown fields are
 * ignored; a malformed payload becomes "unavailable" rather than a false
 * "approved".
 */
const analyticsAccessSchema = z.object({
  canRequest: z.boolean(),
  creatorTier: z.enum(["STARTER", "TRUSTED", "ESTABLISHED"]),
  decidedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  feature: z.literal("analytics.premium"),
  premium: z.boolean(),
  requestStatus: z.enum([
    "NONE",
    "PENDING",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
    "NOT_REQUIRED",
  ]),
  requestedAt: z.string().nullable(),
  source: z.enum(["REQUEST", "ADMIN", "PAID"]).nullable(),
});

export type AnalyticsAccess = z.infer<typeof analyticsAccessSchema>;

export type AnalyticsAccessView =
  | { access: AnalyticsAccess; status: "premium" }
  | { access: AnalyticsAccess; status: "pending" }
  | { access: AnalyticsAccess; status: "rejected" }
  | { access: AnalyticsAccess; status: "expired" }
  | { access: AnalyticsAccess; status: "available" }
  | { status: "signed_out" }
  | { status: "not_configured" }
  | { reason: string; status: "unavailable" };

export function toAnalyticsAccessView(payload: unknown): AnalyticsAccessView {
  const parsed = analyticsAccessSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      reason: "The analytics service returned an unexpected response.",
      status: "unavailable",
    };
  }

  const access = parsed.data;
  if (
    access.premium ||
    access.requestStatus === "APPROVED" ||
    access.requestStatus === "NOT_REQUIRED"
  ) {
    return { access, status: "premium" };
  }
  if (access.requestStatus === "PENDING") return { access, status: "pending" };
  if (access.requestStatus === "REJECTED") {
    return { access, status: "rejected" };
  }
  if (access.requestStatus === "EXPIRED") return { access, status: "expired" };
  return { access, status: "available" };
}

export function accessNotice(
  value: string | string[] | undefined,
): "requested" | "error" | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "requested" || raw === "error" ? raw : null;
}

/** A UTC calendar date for an API instant, or `null` when it is unusable. */
export function formatAccessDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}
