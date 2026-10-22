import { adminCan, type AdminActor } from "@/features/admin/permissions";
import { previewAdCreatives } from "@/features/advertising/content/preview-advertising";
import {
  applyAdAction,
  validateAdCreativeInput,
  type AdCreativeInput,
} from "@/features/advertising/lib/validation";
import type {
  AdAction,
  AdAdminEvent,
  AdCreative,
  AdCreativeStatus,
} from "@/features/advertising/types";

/**
 * Browser-only advertising inventory store.
 *
 * No authenticated admin session or advertising endpoint exists in this build,
 * so the strongest honest claim is a preview record on this device. The shape
 * mirrors what a server repository would own: creatives plus an append-only
 * audit trail. Replacing this module with an API client is the integration
 * point, and no other file assumes the store is authoritative.
 */

const STORE_KEY = "inverge:admin:advertising:v1";

export type AdvertisingAdminStore = {
  version: 1;
  creatives: Readonly<Record<string, AdCreative>>;
  events: readonly AdAdminEvent[];
};

const INITIAL_CREATIVES: Record<string, AdCreative> = Object.fromEntries(
  previewAdCreatives.map((creative) => [creative.id, creative]),
);

const INITIAL_STORE: AdvertisingAdminStore = {
  creatives: INITIAL_CREATIVES,
  events: [],
  version: 1,
};

export type AdSaveResult =
  | { ok: true; creative: AdCreative }
  | { ok: false; errors: Readonly<Record<string, string>> };

const STATUSES: readonly AdCreativeStatus[] = [
  "approved",
  "draft",
  "ended",
  "paused",
  "pending-review",
  "rejected",
];

const ACTIONS: readonly AdAction[] = [
  "approve",
  "end",
  "pause",
  "reject",
  "resume",
  "submit",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isCreative(value: unknown): value is AdCreative {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.advertiser === "string" &&
    typeof value.headline === "string" &&
    typeof value.body === "string" &&
    typeof value.ctaLabel === "string" &&
    typeof value.destination === "string" &&
    typeof value.format === "string" &&
    typeof value.kind === "string" &&
    typeof value.status === "string" &&
    (STATUSES as readonly string[]).includes(value.status) &&
    typeof value.startsAt === "string" &&
    typeof value.endsAt === "string" &&
    isStringArray(value.placements) &&
    isStringArray(value.categories) &&
    isStringArray(value.regions) &&
    typeof value.priority === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isActor(value: unknown): value is AdminActor {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.role === "platform_admin" ||
      value.role === "organiser" ||
      value.role === "judge")
  );
}

function isEvent(value: unknown): value is AdAdminEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.at === "string" &&
    isActor(value.actor) &&
    typeof value.action === "string" &&
    (ACTIONS as readonly string[]).includes(value.action) &&
    typeof value.creativeId === "string" &&
    typeof value.creativeHeadline === "string" &&
    typeof value.from === "string" &&
    typeof value.to === "string" &&
    (value.reason === null || typeof value.reason === "string")
  );
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStore(): AdvertisingAdminStore {
  if (!canUseStorage()) return INITIAL_STORE;

  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return INITIAL_STORE;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.creatives)) return INITIAL_STORE;

    const creatives: Record<string, AdCreative> = {};
    for (const [id, creative] of Object.entries(parsed.creatives)) {
      if (isCreative(creative) && creative.id === id) creatives[id] = creative;
    }
    if (Object.keys(creatives).length === 0) return INITIAL_STORE;

    const events = Array.isArray(parsed.events)
      ? parsed.events.filter(isEvent)
      : [];

    return { creatives, events, version: 1 };
  } catch {
    return INITIAL_STORE;
  }
}

let snapshotCache: AdvertisingAdminStore | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function writeStore(store: AdvertisingAdminStore): void {
  snapshotCache = store;
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // A failed write stays in memory for this tab and is never described as
      // persisted.
    }
  }
  notify();
}

export function getAdvertisingStoreSnapshot(): AdvertisingAdminStore {
  if (!canUseStorage()) return INITIAL_STORE;
  if (snapshotCache === null) snapshotCache = readStore();
  return snapshotCache;
}

export function getServerAdvertisingStoreSnapshot(): AdvertisingAdminStore {
  return INITIAL_STORE;
}

export function subscribeAdvertisingStore(listener: () => void): () => void {
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

export function resetAdvertisingStore(): void {
  snapshotCache = INITIAL_STORE;
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch {
      // Ignore an unavailable store.
    }
  }
  notify();
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 32) || "creative"
  );
}

/**
 * Create or edit a creative.
 *
 * Any edit returns the creative to `draft` so an approved message cannot be
 * changed into a different offer without a second approval. The status history
 * remains in the audit array rather than being rewritten.
 */
export function saveAdvertisingCreative(
  input: AdCreativeInput,
  actor: AdminActor,
  now: string,
): AdSaveResult {
  if (!adminCan(actor.role, "advertising:manage")) {
    return {
      errors: { form: "This account cannot manage advertising inventory." },
      ok: false,
    };
  }

  const validation = validateAdCreativeInput(input);
  if (!validation.ok) return { errors: validation.errors, ok: false };

  const store = readStore();
  const existing = input.id ? store.creatives[input.id] : undefined;
  const id =
    existing?.id ??
    `ad-${slug(validation.draft.advertiser)}-${Date.parse(now)}`;
  const creative: AdCreative = {
    ...validation.draft,
    createdAt: existing?.createdAt ?? now,
    id,
    status: "draft",
    updatedAt: now,
  };

  writeStore({
    creatives: { ...store.creatives, [id]: creative },
    events: store.events,
    version: 1,
  });

  return {
    creative,
    ok: true,
  };
}

export type AdTransitionResult =
  { ok: true; creative: AdCreative } | { ok: false; message: string };

export function transitionAdvertisingCreative(
  creativeId: string,
  action: AdAction,
  actor: AdminActor,
  at: string,
  reason = "",
): AdTransitionResult {
  const store = readStore();
  const creative = store.creatives[creativeId];
  if (!creative) return { message: "Creative not found.", ok: false };

  const result = applyAdAction({ action, actor, at, creative, reason });
  if (!result.ok) return { message: result.message, ok: false };

  writeStore({
    creatives: { ...store.creatives, [creativeId]: result.creative },
    events: [result.event, ...store.events],
    version: 1,
  });

  return { creative: result.creative, ok: true };
}

export function advertisingStoreFor(
  store: AdvertisingAdminStore,
): readonly AdCreative[] {
  return Object.values(store.creatives).toSorted((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}
