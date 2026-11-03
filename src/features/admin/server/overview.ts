import "server-only";

import { z } from "zod";

import {
  adminAnalyticsSchema,
  overviewRange,
  platformEscrowSchema,
  platformSummarySchema,
  type AdminOverviewData,
  type OverviewPeriod,
  type OverviewSection,
} from "@/features/admin/lib/overview";
import type { AdminActor } from "@/features/admin/permissions";
import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
} from "@/lib/api/server";

export type AdminOverviewResult =
  | { status: "denied" }
  | { status: "preview"; actor: AdminActor }
  | { status: "live"; actor: AdminActor; view: AdminOverviewData };

async function readSection<T>(
  path: string,
  schema: z.ZodType<T>,
  token?: string,
): Promise<OverviewSection<T>> {
  try {
    const payload = await fetchApiJson<unknown>(path, token ? { token } : {});
    const parsed = schema.safeParse(payload);
    return parsed.success
      ? { status: "ready", data: parsed.data }
      : {
          status: "unavailable",
          reason:
            "The service returned an incomplete or invalid report. Refresh to try again.",
        };
  } catch (error) {
    const status = error instanceof ApiRequestError ? error.status : 0;
    const reason =
      status === 401
        ? "Your session could not be verified. Sign in again to load this report."
        : status === 403
          ? "Your account does not have access to this report."
          : status === 404
            ? "This report is not enabled on the connected service."
            : "This report could not be loaded. Refresh to try again.";
    return { status: "unavailable", reason };
  }
}

/**
 * FR-901: gate the read itself, not just the navigation. Every read is fresh
 * (`fetchApiJson` uses no-store); the upstream public snapshots cache for 60s.
 * A live failure never borrows campaign fixtures or browser-local decisions.
 */
export async function getAdminOverview(
  period: OverviewPeriod,
): Promise<AdminOverviewResult> {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return { status: "denied" };
  if (access.preview) return { status: "preview", actor: access.actor };

  const now = new Date();
  const range = overviewRange(period, now);
  const token = await readSessionToken();
  if (!token || !isApiConfigured()) {
    const missing = {
      status: "unavailable" as const,
      reason: !token
        ? "Your session could not be verified. Sign in again to load the overview."
        : "The account service is not configured for this deployment.",
    };
    return {
      status: "live",
      actor: access.actor,
      view: {
        summary: missing,
        escrow: missing,
        analytics: missing,
        period,
        range,
        readAt: now.toISOString(),
      },
    };
  }

  const query = new URLSearchParams({ ...range, interval: "day" });
  // Keep all three sections independent: failure of one service does not erase
  // a successful response from another. Do not send private tokens to public reads.
  const [summary, escrow, analytics] = await Promise.all([
    readSection("/platform/summary", platformSummarySchema),
    readSection("/platform/escrow", platformEscrowSchema),
    readSection(
      `/admin/analytics/overview?${query}`,
      adminAnalyticsSchema.refine(
        (report) => report.from === range.from && report.to === range.to,
        "The report must match the requested date range.",
      ),
      token,
    ),
  ]);

  return {
    status: "live",
    actor: access.actor,
    view: {
      summary,
      escrow,
      analytics,
      period,
      range,
      readAt: now.toISOString(),
    },
  };
}
