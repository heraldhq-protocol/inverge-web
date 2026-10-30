import "server-only";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { toDiscoveryIdea, type ApiIdea } from "@/features/ideas/server/live-ideas";
import { prePledgesPreviewData } from "@/features/pre-pledges/content/preview-data";
import type {
  PrePledgesData,
  PrePledgeRecord,
} from "@/features/pre-pledges/types";
import { ApiRequestError, fetchApiJson, isApiConfigured } from "@/lib/api/server";
import { decimalToUsdAmount } from "@/lib/money";

/**
 * The signed-in creator's pre-pledges.
 *
 * These are non-binding signals, not payments. The API returns the intent and
 * the public idea projection; the web derives the display stage from the idea's
 * workflow status and gate. Preview auth keeps the fixture account, while a live
 * API failure is surfaced instead of replacing it with fixtures.
 */
type ApiPrePledge = {
  amountUsd: string;
  createdAt: string;
  currency: string;
  idea: ApiIdea;
};

type ApiPrePledgePage = {
  data: ApiPrePledge[];
  truncated: boolean;
};

export type PrePledgesView =
  | {
      status: "ready";
      data: PrePledgesData;
      dataSource: "live" | "preview";
    }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

const PAST_IDEA_STATUSES = new Set(["ARCHIVED", "CONVERTED", "REJECTED"]);

function relativeLabel(iso: string, now = Date.now()): string {
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return "Unknown";

  const days = Math.floor((now - timestamp) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

function statusFor(idea: ApiIdea, past: boolean) {
  if (past) return "validation-closed" as const;
  if (idea.status === "THRESHOLD_MET") return "near-validation" as const;
  return toDiscoveryIdea(idea).validationPercent >= 70
    ? ("near-validation" as const)
    : ("validating" as const);
}

function toRecord(item: ApiPrePledge): PrePledgeRecord {
  const past = PAST_IDEA_STATUSES.has(item.idea.status);
  return {
    idea: toDiscoveryIdea(item.idea),
    intent: decimalToUsdAmount(item.amountUsd),
    stage: past ? "past" : "active",
    status: statusFor(item.idea, past),
    updatedAt: item.createdAt,
    updatedLabel: relativeLabel(item.createdAt),
  };
}

export async function getPrePledgesView(): Promise<PrePledgesView> {
  if (isPreviewAuth() || !isApiConfigured()) {
    return {
      data: prePledgesPreviewData,
      dataSource: "preview",
      status: "ready",
    };
  }

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  try {
    const page = await fetchApiJson<ApiPrePledgePage>("/me/pre-pledges?limit=50", {
      token,
    });
    const records = page.data.map(toRecord);
    return {
      data: {
        active: records.filter((record) => record.stage === "active"),
        past: records.filter((record) => record.stage === "past"),
      },
      dataSource: "live",
      status: "ready",
    };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: "signed_out" };
    }
    return {
      reason:
        error instanceof ApiRequestError
          ? error.message
          : "The API could not be reached.",
      status: "unavailable",
    };
  }
}
