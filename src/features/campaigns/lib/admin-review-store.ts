import type { AdminActor, AdminRole } from "@/features/admin/permissions";
import {
  applyCampaignReviewOverride,
  decideCampaignReview,
  type CampaignReviewAction,
  type CampaignReviewAuditEntry,
  type CampaignReviewDecisionResult,
  type CampaignReviewOverride,
} from "@/features/campaigns/lib/admin-review";
import type {
  Campaign,
  CampaignPhase,
  CampaignReview,
} from "@/features/campaigns/types";

/**
 * Browser-only campaign review store.
 *
 * This is deliberately not an API client. There is no authenticated web session
 * and no campaign review endpoint, so a decision can only be a preview record.
 * Keeping the boundary here lets every surface state that fact and gives the
 * eventual server implementation one place to replace.
 */

const STORE_KEY = "inverge:admin:campaign-reviews:v1";

export type CampaignReviewStore = {
  version: 1;
  overrides: Readonly<Record<string, CampaignReviewOverride>>;
  events: readonly CampaignReviewAuditEntry[];
};

const EMPTY_STORE: CampaignReviewStore = {
  events: [],
  overrides: {},
  version: 1,
};

export function getCampaignReviewStoreKey(): string {
  return STORE_KEY;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isAdminRole(value: unknown): value is AdminRole {
  return (
    value === "platform_admin" || value === "organiser" || value === "judge"
  );
}

const REVIEW_STATUSES = [
  "approved",
  "changes-requested",
  "in-review",
  "not-submitted",
  "rejected",
] as const satisfies readonly CampaignReview["status"][];

const PHASES = [
  "changes-requested",
  "completed",
  "delivering",
  "draft",
  "funding",
  "funding-failed",
  "in-review",
  "paused",
  "rejected",
  "unknown",
] as const satisfies readonly CampaignPhase[];

function isReviewStatus(value: unknown): value is CampaignReview["status"] {
  return (REVIEW_STATUSES as readonly unknown[]).includes(value);
}

function isPhase(value: unknown): value is CampaignPhase {
  return (PHASES as readonly unknown[]).includes(value);
}

function isReview(value: unknown): value is CampaignReview {
  if (!isRecord(value) || !isReviewStatus(value.status)) return false;

  switch (value.status) {
    case "not-submitted":
      return true;
    case "in-review":
      return isString(value.submittedAt);
    case "changes-requested":
      return isString(value.requestedAt) && isString(value.summary);
    case "rejected":
      return isString(value.decidedAt) && isString(value.reason);
    case "approved":
      return isString(value.approvedAt);
  }
}

function isOverride(value: unknown): value is CampaignReviewOverride {
  return (
    isRecord(value) &&
    isString(value.campaignId) &&
    isPhase(value.phase) &&
    isReview(value.review) &&
    (value.publishedAt === null || isString(value.publishedAt)) &&
    isString(value.updatedAt)
  );
}

function isActor(value: unknown): value is AdminActor {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isAdminRole(value.role)
  );
}

function isAuditEntry(value: unknown): value is CampaignReviewAuditEntry {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.at) &&
    isActor(value.actor) &&
    (value.action === "approve" ||
      value.action === "request-changes" ||
      value.action === "reject") &&
    isString(value.campaignId) &&
    isString(value.campaignTitle) &&
    isReviewStatus(value.from) &&
    isReviewStatus(value.to) &&
    (value.reason === null || isString(value.reason))
  );
}

function readStore(): CampaignReviewStore {
  if (!canUseStorage()) return EMPTY_STORE;

  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_STORE;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return EMPTY_STORE;

    const overrides: Record<string, CampaignReviewOverride> = {};
    if (isRecord(parsed.overrides)) {
      for (const [campaignId, override] of Object.entries(parsed.overrides)) {
        if (isOverride(override) && override.campaignId === campaignId) {
          overrides[campaignId] = override;
        }
      }
    }

    const events = Array.isArray(parsed.events)
      ? parsed.events.filter(isAuditEntry)
      : [];

    return { events, overrides, version: 1 };
  } catch {
    return EMPTY_STORE;
  }
}

let snapshotCache: CampaignReviewStore | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function writeStore(store: CampaignReviewStore): void {
  snapshotCache = store;
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // A disabled or full store must not make a preview decision look persisted.
    }
  }
  notify();
}

export function getCampaignReviewStoreSnapshot(): CampaignReviewStore {
  if (!canUseStorage()) return EMPTY_STORE;
  if (snapshotCache === null) snapshotCache = readStore();
  return snapshotCache;
}

export function getServerCampaignReviewStoreSnapshot(): CampaignReviewStore {
  return EMPTY_STORE;
}

export function subscribeCampaignReviewStore(listener: () => void): () => void {
  if (!canUseStorage()) return () => {};

  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORE_KEY) return;
    snapshotCache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export type RecordCampaignReviewInput = {
  action: CampaignReviewAction;
  actor: AdminActor;
  reason: string;
};

/**
 * Append a preview decision.
 *
 * The current store is read from scratch before deciding so a stale React
 * snapshot cannot approve a campaign twice. A successful decision replaces the
 * campaign override and prepends the audit event; a failed one writes nothing.
 */
export function recordCampaignReview(
  campaign: Campaign,
  input: RecordCampaignReviewInput,
): CampaignReviewDecisionResult {
  const store = readStore();
  const effective = applyCampaignReviewOverride(
    campaign,
    store.overrides[campaign.id],
  );
  const at = new Date().toISOString();
  const result = decideCampaignReview({
    action: input.action,
    actor: input.actor,
    at,
    campaign: effective,
    eventId: `review-${campaign.id}-${at}-${input.action}`,
    reason: input.reason,
  });

  if (!result.ok) return result;

  writeStore({
    events: [result.decision.event, ...store.events],
    overrides: {
      ...store.overrides,
      [campaign.id]: result.decision.override,
    },
    version: 1,
  });

  return result;
}
