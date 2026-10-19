import { describe, expect, it, vi } from "vitest";

import {
  SAVED_CAMPAIGNS_SCHEMA_VERSION,
  SAVED_CAMPAIGNS_SCOPE,
  SAVED_CAMPAIGNS_SHORT_NOTE,
  SAVED_CAMPAIGNS_STORAGE_KEY,
  createSavedCampaignsStore,
  isCampaignSaved,
  parseSavedCampaigns,
  saveCampaign,
  savedCampaignRecord,
  serializeSavedCampaigns,
  unsaveCampaign,
  type SavedCampaignRecord,
  type SavedCampaignsStorage,
} from "@/features/campaigns/lib/saved-campaigns";

const record = (
  campaignId: string,
  savedAt = "2026-01-01T00:00:00.000Z",
): SavedCampaignRecord => ({
  campaignId,
  savedAt,
  slug: `${campaignId}-slug`,
});

function fakeStorage(initial?: string) {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(SAVED_CAMPAIGNS_STORAGE_KEY, initial);

  return {
    getItem: (key: string) => map.get(key) ?? null,
    map,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } satisfies SavedCampaignsStorage & { map: Map<string, string> };
}

describe("SAVED_CAMPAIGNS_SCOPE", () => {
  it("says the saves are browser-local rather than promising account sync", () => {
    expect(SAVED_CAMPAIGNS_SCOPE).toContain("this browser only");
    expect(SAVED_CAMPAIGNS_SHORT_NOTE).toContain("this browser");
  });
});

describe("parseSavedCampaigns", () => {
  it("returns nothing for absent, empty, or unparseable values", () => {
    expect(parseSavedCampaigns(null)).toEqual([]);
    expect(parseSavedCampaigns("   ")).toEqual([]);
    expect(parseSavedCampaigns("{not json")).toEqual([]);
    expect(parseSavedCampaigns('"a string"')).toEqual([]);
  });

  it("discards a payload written by a different schema version", () => {
    const raw = JSON.stringify({
      records: [record("campaign-a")],
      version: SAVED_CAMPAIGNS_SCHEMA_VERSION + 1,
    });

    expect(parseSavedCampaigns(raw)).toEqual([]);
  });

  it("keeps the records it can trust and drops the ones it cannot", () => {
    const raw = JSON.stringify({
      records: [
        record("campaign-a"),
        { campaignId: "", savedAt: "2026-01-01T00:00:00.000Z", slug: "x" },
        { campaignId: "campaign-b" },
        null,
        record("campaign-c"),
      ],
      version: SAVED_CAMPAIGNS_SCHEMA_VERSION,
    });

    expect(parseSavedCampaigns(raw).map((entry) => entry.campaignId)).toEqual([
      "campaign-a",
      "campaign-c",
    ]);
  });

  it("collapses a duplicated campaign to one record", () => {
    const raw = JSON.stringify({
      records: [record("campaign-a"), record("campaign-a", "2026-02-02")],
      version: SAVED_CAMPAIGNS_SCHEMA_VERSION,
    });

    expect(parseSavedCampaigns(raw)).toHaveLength(1);
  });
});

describe("serializeSavedCampaigns", () => {
  it("round-trips through its own envelope", () => {
    const records = [record("campaign-a"), record("campaign-b")];

    expect(parseSavedCampaigns(serializeSavedCampaigns(records))).toEqual(
      records,
    );
  });

  it("writes the current version into the envelope", () => {
    const parsed = JSON.parse(
      serializeSavedCampaigns([record("campaign-a")]),
    ) as { version: number };

    expect(parsed.version).toBe(SAVED_CAMPAIGNS_SCHEMA_VERSION);
  });
});

describe("saveCampaign", () => {
  it("puts the newest save first", () => {
    const result = saveCampaign([record("campaign-a")], record("campaign-b"));

    expect(result.map((entry) => entry.campaignId)).toEqual([
      "campaign-b",
      "campaign-a",
    ]);
  });

  it("does not save twice, so the list cannot reorder under the user", () => {
    const existing = [record("campaign-a", "2026-01-01T00:00:00.000Z")];
    const result = saveCampaign(existing, record("campaign-a", "2026-09-09"));

    expect(result).toHaveLength(1);
    expect(result[0]?.savedAt).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("unsaveCampaign", () => {
  it("removes a saved campaign and ignores one that is not there", () => {
    const existing = [record("campaign-a"), record("campaign-b")];

    expect(
      unsaveCampaign(existing, "campaign-a").map((r) => r.campaignId),
    ).toEqual(["campaign-b"]);
    expect(unsaveCampaign(existing, "campaign-zzz")).toHaveLength(2);
  });
});

describe("isCampaignSaved", () => {
  it("answers by campaign id", () => {
    const existing = [record("campaign-a")];

    expect(isCampaignSaved(existing, "campaign-a")).toBe(true);
    expect(isCampaignSaved(existing, "campaign-b")).toBe(false);
  });
});

describe("savedCampaignRecord", () => {
  it("stamps the record with the instant it was saved", () => {
    expect(
      savedCampaignRecord(
        { campaignId: "campaign-a", slug: "a-slug" },
        "2026-03-03T10:00:00.000Z",
      ),
    ).toEqual({
      campaignId: "campaign-a",
      savedAt: "2026-03-03T10:00:00.000Z",
      slug: "a-slug",
    });
  });
});

describe("createSavedCampaignsStore", () => {
  it("writes and reads back through the storage boundary", async () => {
    const storage = fakeStorage();
    const store = createSavedCampaignsStore(storage);

    await store.write([record("campaign-a")]);

    expect(await store.read()).toEqual([record("campaign-a")]);
    expect(storage.map.get(SAVED_CAMPAIGNS_STORAGE_KEY)).toContain(
      "campaign-a",
    );
  });

  it("reads nothing when storage is unavailable", async () => {
    expect(await createSavedCampaignsStore(null).read()).toEqual([]);
  });

  it("rejects a write when storage is unavailable, rather than claiming success", async () => {
    await expect(
      createSavedCampaignsStore(null).write([record("campaign-a")]),
    ).rejects.toThrow(/no storage/);
  });

  it("rejects a write the browser refused", async () => {
    const store = createSavedCampaignsStore({
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });

    await expect(store.write([record("campaign-a")])).rejects.toThrow(
      /refused to store/,
    );
  });

  it("rejects a read the browser refused, so a surface can say so", async () => {
    const store = createSavedCampaignsStore({
      getItem: () => {
        throw new Error("Blocked");
      },
      setItem: vi.fn(),
    });

    await expect(store.read()).rejects.toThrow("Blocked");
  });

  it("returns nothing when the stored value is missing or unreadable", async () => {
    expect(await createSavedCampaignsStore(fakeStorage()).read()).toEqual([]);
    expect(
      await createSavedCampaignsStore(fakeStorage("{truncated")).read(),
    ).toEqual([]);
  });
});
