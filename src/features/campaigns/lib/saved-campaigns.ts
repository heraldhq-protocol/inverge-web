/**
 * Saved campaigns.
 *
 * Inverge's web client has no session, no account, and no database, so there is
 * nowhere to attach a per-account saved list. Rather than put a button on the
 * page that persists nothing, saved campaigns are kept in *this browser* behind
 * the `SavedCampaignsStore` boundary below. Everything that reads or writes a
 * saved campaign goes through that interface, so the day the campaigns API
 * exposes a saved-campaigns resource, one implementation is replaced and no
 * component changes.
 *
 * What this is not: account-synchronised. `SAVED_CAMPAIGNS_SCOPE` is the single
 * string every surface uses to describe the limitation, and no surface may claim
 * a save survives on another device.
 *
 * The stored payload is a versioned envelope so a future schema change can be
 * detected and discarded rather than misread.
 */

/** The one place the scope of a save is described. */
export const SAVED_CAMPAIGNS_SCOPE =
  "Saved campaigns are kept in this browser only. Account sync opens when sign-in is connected.";

/**
 * The compact form, for surfaces with no room for the full sentence.
 *
 * Still says the true thing — the saves are device-local — without promising an
 * account feature that does not exist yet.
 */
export const SAVED_CAMPAIGNS_SHORT_NOTE =
  "Saved campaigns stay in this browser for now.";

export const SAVED_CAMPAIGNS_STORAGE_KEY = "inverge.saved-campaigns";

/**
 * Dispatched on `window` after a save write resolves.
 *
 * Other surfaces (discovery's "Saved projects" view) listen for this rather than
 * polling storage, so a save on one card updates a filter without a reload.
 */
export const SAVED_CAMPAIGNS_EVENT = "inverge:saved-campaigns-changed";

export const SAVED_CAMPAIGNS_SCHEMA_VERSION = 1;

/** A saved campaign, as persisted. The id is the identity; the slug is for links. */
export type SavedCampaignRecord = {
  campaignId: string;
  slug: string;
  /** ISO instant the campaign was saved. */
  savedAt: string;
};

type SavedCampaignsEnvelope = {
  version: number;
  records: unknown;
};

/**
 * The persistence boundary.
 *
 * Both methods are async even though the current implementation is synchronous
 * local storage: a caller must not be able to tell, because the account-backed
 * store will be remote and the components already await it.
 *
 * `write` rejects when the value could not be persisted. A caller must only show
 * a saved state after `write` resolves — never optimistically.
 */
export type SavedCampaignsStore = {
  read(): Promise<readonly SavedCampaignRecord[]>;
  write(records: readonly SavedCampaignRecord[]): Promise<void>;
};

function isSavedCampaignRecord(value: unknown): value is SavedCampaignRecord {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.campaignId === "string" &&
    candidate.campaignId !== "" &&
    typeof candidate.slug === "string" &&
    candidate.slug !== "" &&
    typeof candidate.savedAt === "string" &&
    candidate.savedAt !== ""
  );
}

/**
 * Reads records from a stored string, dropping anything it cannot trust.
 *
 * A hand-edited, truncated, or future-versioned value yields an empty list
 * rather than a throw or a half-parsed record: saved campaigns are a
 * convenience, and losing them must never break the page that reads them.
 */
export function parseSavedCampaigns(
  raw: string | null,
): readonly SavedCampaignRecord[] {
  if (raw === null || raw.trim() === "") return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (typeof parsed !== "object" || parsed === null) return [];
  const envelope = parsed as Partial<SavedCampaignsEnvelope>;
  if (envelope.version !== SAVED_CAMPAIGNS_SCHEMA_VERSION) return [];
  if (!Array.isArray(envelope.records)) return [];

  const seen = new Set<string>();
  const records: SavedCampaignRecord[] = [];

  for (const entry of envelope.records) {
    if (!isSavedCampaignRecord(entry)) continue;
    if (seen.has(entry.campaignId)) continue;
    seen.add(entry.campaignId);
    records.push({
      campaignId: entry.campaignId,
      savedAt: entry.savedAt,
      slug: entry.slug,
    });
  }

  return records;
}

/** Serialises records into the versioned envelope. */
export function serializeSavedCampaigns(
  records: readonly SavedCampaignRecord[],
): string {
  return JSON.stringify({
    records: records.map((record) => ({
      campaignId: record.campaignId,
      savedAt: record.savedAt,
      slug: record.slug,
    })),
    version: SAVED_CAMPAIGNS_SCHEMA_VERSION,
  });
}

/** Where the campaign sits in a saved list. */
export function isCampaignSaved(
  records: readonly SavedCampaignRecord[],
  campaignId: string,
): boolean {
  return records.some((record) => record.campaignId === campaignId);
}

/**
 * Adds a campaign, newest first.
 *
 * Saving twice is not two saves: an existing record keeps its original
 * timestamp so the list does not reorder under the user.
 */
export function saveCampaign(
  records: readonly SavedCampaignRecord[],
  record: SavedCampaignRecord,
): readonly SavedCampaignRecord[] {
  if (isCampaignSaved(records, record.campaignId)) return records;
  return [record, ...records];
}

/** Removes a campaign. Removing something absent is a no-op, not an error. */
export function unsaveCampaign(
  records: readonly SavedCampaignRecord[],
  campaignId: string,
): readonly SavedCampaignRecord[] {
  return records.filter((record) => record.campaignId !== campaignId);
}

/** The record to persist for a campaign, stamped and ready. */
export function savedCampaignRecord(
  campaign: Pick<SavedCampaignRecord, "campaignId" | "slug">,
  savedAt: string,
): SavedCampaignRecord {
  return { campaignId: campaign.campaignId, savedAt, slug: campaign.slug };
}

/** The minimal storage surface this module needs, so a test can supply a fake. */
export type SavedCampaignsStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * A store over a `localStorage`-shaped object.
 *
 * `storage` is `null` when storage is genuinely unavailable — a server render, a
 * privacy mode that throws on access, or a blocked origin. Reads then return
 * nothing and writes reject, which is the truth; the UI reports "could not
 * save" rather than pretending.
 */
export function createSavedCampaignsStore(
  storage: SavedCampaignsStorage | null,
): SavedCampaignsStore {
  return {
    async read() {
      if (storage === null) return [];

      // A storage that exists but refuses to be read is a failure, not an empty
      // list. The surfaces distinguish "nothing saved yet" from "could not read
      // the store", so swallowing this would show an empty list where the truth
      // is unknown. A missing or malformed value is still handled by
      // `parseSavedCampaigns`, which is where losing a convenience must not
      // break the page.
      return parseSavedCampaigns(storage.getItem(SAVED_CAMPAIGNS_STORAGE_KEY));
    },

    async write(records) {
      if (storage === null) {
        throw new Error("This browser has no storage, so nothing was saved.");
      }

      try {
        storage.setItem(
          SAVED_CAMPAIGNS_STORAGE_KEY,
          serializeSavedCampaigns(records),
        );
      } catch {
        // A full disk or a blocked origin. The caller must not report success.
        throw new Error("This browser refused to store the change.");
      }
    },
  };
}

/**
 * The storage this device offers, or `null`.
 *
 * Touching `window.localStorage` itself can throw in a locked-down browser, so
 * the property read is guarded rather than assumed.
 */
function deviceStorage(): SavedCampaignsStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The store the app uses. Replace this line when the account store lands. */
export function savedCampaignsStore(): SavedCampaignsStore {
  return createSavedCampaignsStore(deviceStorage());
}
