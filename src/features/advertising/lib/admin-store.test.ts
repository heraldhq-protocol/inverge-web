import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminActor } from "@/features/admin/permissions";
import type { AdCreativeInput } from "@/features/advertising/lib/validation";

const NOW = "2026-10-22T12:00:00.000Z";
const STORE_KEY = "inverge:admin:advertising:v1";

const platformAdmin: AdminActor = {
  id: "admin-1",
  name: "Ada",
  role: "platform_admin",
};
const organiser: AdminActor = {
  id: "org-1",
  name: "Bola",
  role: "organiser",
};
const judge: AdminActor = { id: "judge-1", name: "Chidi", role: "judge" };

function input(overrides: Partial<AdCreativeInput> = {}): AdCreativeInput {
  return {
    advertiser: "Northstar Tools",
    body: "A workspace for small teams that need invoices, stock, and receipts.",
    categories: [],
    ctaLabel: "See the workspace",
    destination: "https://example.com/northstar",
    endsAt: "2026-12-31T23:59:59.000Z",
    format: "native-card",
    headline: "Run the shop without the spreadsheet",
    placements: ["campaign-feed-inline"],
    priority: 50,
    regions: [],
    startsAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

async function store() {
  return import("@/features/advertising/lib/admin-store");
}

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

afterEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

describe("advertising preview store", () => {
  it("starts from the preview inventory with no audit history", async () => {
    const { getAdvertisingStoreSnapshot, getServerAdvertisingStoreSnapshot } =
      await store();

    const snapshot = getAdvertisingStoreSnapshot();
    expect(Object.keys(snapshot.creatives).length).toBeGreaterThan(0);
    expect(snapshot.events).toEqual([]);
    expect(getServerAdvertisingStoreSnapshot()).toBe(snapshot);
  });

  it("refuses to save for an account without advertising management", async () => {
    const { saveAdvertisingCreative, getAdvertisingStoreSnapshot } =
      await store();
    const before = Object.keys(getAdvertisingStoreSnapshot().creatives).length;

    const result = saveAdvertisingCreative(input(), judge, NOW);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toBeDefined();
    expect(Object.keys(getAdvertisingStoreSnapshot().creatives)).toHaveLength(
      before,
    );
  });

  it("refuses invalid copy without writing a record", async () => {
    const { saveAdvertisingCreative, getAdvertisingStoreSnapshot } =
      await store();
    const before = Object.keys(getAdvertisingStoreSnapshot().creatives).length;

    const result = saveAdvertisingCreative(
      input({ destination: "javascript:alert(1)" }),
      organiser,
      NOW,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.destination).toBeDefined();
    expect(Object.keys(getAdvertisingStoreSnapshot().creatives)).toHaveLength(
      before,
    );
  });

  it("creates a new creative as a draft owned by the store", async () => {
    const { saveAdvertisingCreative, getAdvertisingStoreSnapshot } =
      await store();

    const result = saveAdvertisingCreative(input(), organiser, NOW);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.creative).toMatchObject({
      advertiser: "Northstar Tools",
      createdAt: NOW,
      kind: "first-party",
      status: "draft",
      updatedAt: NOW,
    });
    expect(result.creative.id).toMatch(/^ad-northstar-tools-/);
    expect(getAdvertisingStoreSnapshot().creatives[result.creative.id]).toEqual(
      result.creative,
    );
  });

  it("returns an edited creative to draft so approval cannot be reused", async () => {
    const { saveAdvertisingCreative, getAdvertisingStoreSnapshot } =
      await store();
    const existing =
      getAdvertisingStoreSnapshot().creatives["northstar-native-2026"];
    if (!existing) throw new Error("Expected the preview creative");

    const result = saveAdvertisingCreative(
      {
        ...input({
          body: "A different offer that was never reviewed by anyone.",
          headline: "A brand new promise for your shop",
        }),
        id: existing.id,
      },
      organiser,
      NOW,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.creative.id).toBe(existing.id);
    expect(result.creative.createdAt).toBe(existing.createdAt);
    expect(result.creative.status).toBe("draft");
    expect(result.creative.updatedAt).toBe(NOW);
    expect(getAdvertisingStoreSnapshot().creatives[existing.id]?.headline).toBe(
      "A brand new promise for your shop",
    );
  });

  it("writes a lifecycle change and an append-only audit event", async () => {
    const { transitionAdvertisingCreative, getAdvertisingStoreSnapshot } =
      await store();

    const result = transitionAdvertisingCreative(
      "northstar-native-2026",
      "pause",
      organiser,
      NOW,
    );

    expect(result.ok).toBe(true);
    const snapshot = getAdvertisingStoreSnapshot();
    expect(snapshot.creatives["northstar-native-2026"]?.status).toBe("paused");
    expect(snapshot.events).toHaveLength(1);
    expect(snapshot.events[0]).toMatchObject({
      action: "pause",
      actor: organiser,
      creativeId: "northstar-native-2026",
      from: "approved",
      to: "paused",
    });
  });

  it("enforces approval permission in the store, not only in the UI", async () => {
    const { transitionAdvertisingCreative, getAdvertisingStoreSnapshot } =
      await store();

    const refused = transitionAdvertisingCreative(
      "amara-logistics-pending-2026",
      "approve",
      organiser,
      NOW,
      "Looks fine.",
    );
    expect(refused.ok).toBe(false);
    expect(
      getAdvertisingStoreSnapshot().creatives["amara-logistics-pending-2026"]
        ?.status,
    ).toBe("pending-review");

    const approved = transitionAdvertisingCreative(
      "amara-logistics-pending-2026",
      "approve",
      platformAdmin,
      NOW,
    );
    expect(approved.ok).toBe(true);
    expect(
      getAdvertisingStoreSnapshot().creatives["amara-logistics-pending-2026"]
        ?.status,
    ).toBe("approved");
    expect(getAdvertisingStoreSnapshot().events).toHaveLength(1);
  });

  it("refuses a transition on a creative that does not exist", async () => {
    const { transitionAdvertisingCreative } = await store();

    const result = transitionAdvertisingCreative(
      "not-a-creative",
      "pause",
      platformAdmin,
      NOW,
    );

    expect(result).toEqual({ message: "Creative not found.", ok: false });
  });

  it("persists to this device and restores after a module reload", async () => {
    const { saveAdvertisingCreative } = await store();
    const result = saveAdvertisingCreative(input(), organiser, NOW);
    if (!result.ok) throw new Error("Expected a saved creative");

    expect(JSON.parse(window.localStorage.getItem(STORE_KEY)!)).toMatchObject({
      version: 1,
    });

    vi.resetModules();
    const reloaded = await store();
    expect(
      reloaded.getAdvertisingStoreSnapshot().creatives[result.creative.id],
    ).toEqual(result.creative);
  });

  it("restores the preview inventory when reset", async () => {
    const {
      saveAdvertisingCreative,
      resetAdvertisingStore,
      getAdvertisingStoreSnapshot,
    } = await store();
    const saved = saveAdvertisingCreative(input(), organiser, NOW);
    if (!saved.ok) throw new Error("Expected a saved creative");

    resetAdvertisingStore();

    expect(window.localStorage.getItem(STORE_KEY)).toBeNull();
    expect(
      getAdvertisingStoreSnapshot().creatives[saved.creative.id],
    ).toBeUndefined();
  });

  it("ignores a corrupt stored record rather than trusting it", async () => {
    window.localStorage.setItem(STORE_KEY, "{not-json");
    const { getAdvertisingStoreSnapshot } = await store();

    const snapshot = getAdvertisingStoreSnapshot();
    expect(snapshot.creatives["northstar-native-2026"]).toBeDefined();
    expect(snapshot.events).toEqual([]);
  });
});
