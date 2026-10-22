"use client";

import {
  AD_CONSENT_STORAGE_KEY,
  createAdConsentRecord,
  parseAdConsent,
  type AdConsentDraft,
  type AdConsentRecord,
} from "@/features/advertising/lib/consent";

/**
 * Browser consent store.
 *
 * The choice lives on this device only. A first visit is "unset", which is the
 * same as refusing both optional purposes.
 */

let cached: AdConsentRecord | null | undefined;
const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function read(): AdConsentRecord | null {
  if (!canUseStorage()) return null;
  try {
    return parseAdConsent(window.localStorage.getItem(AD_CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribeAdConsent(listener: () => void): () => void {
  if (!canUseStorage()) return () => {};
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== AD_CONSENT_STORAGE_KEY) return;
    cached = undefined;
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getAdConsentSnapshot(): AdConsentRecord | null {
  if (!canUseStorage()) return null;
  if (cached === undefined) cached = read();
  return cached;
}

/** Stable server snapshot: no choice has been made on the server. */
export function getServerAdConsentSnapshot(): AdConsentRecord | null {
  return null;
}

/** Test-only reset of the in-memory snapshot; storage is left untouched. */
export function resetAdConsentForTests(): void {
  cached = undefined;
}

export function saveAdConsent(
  draft: AdConsentDraft,
  at = new Date().toISOString(),
): AdConsentRecord {
  const record = createAdConsentRecord(draft, at);
  cached = record;

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(
        AD_CONSENT_STORAGE_KEY,
        JSON.stringify(record),
      );
    } catch {
      // Storage can be full or disabled. A failed write still updates this tab,
      // and the next visit honestly asks again.
    }
  }

  notify();
  return record;
}
