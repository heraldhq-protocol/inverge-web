"use client";

/**
 * Per-device dismissal of a sponsored creative.
 *
 * Dismissal is a courtesy control, not a consent record. It keeps one creative
 * out of the reader's way on this browser without pretending the advertiser or
 * the placement was globally suppressed.
 */

const DISMISSED_KEY = "inverge:advertising-dismissed:v1";
const EMPTY: readonly string[] = [];

let cached: readonly string[] | undefined;
const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function read(): readonly string[] {
  if (!canUseStorage()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (value): value is string =>
        typeof value === "string" && value.length > 0 && value.length < 96,
    );
  } catch {
    return EMPTY;
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribeDismissedAds(listener: () => void): () => void {
  if (!canUseStorage()) return () => {};
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== DISMISSED_KEY) return;
    cached = undefined;
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getDismissedAdsSnapshot(): readonly string[] {
  if (!canUseStorage()) return EMPTY;
  if (cached === undefined) cached = read();
  return cached;
}

export function getServerDismissedAdsSnapshot(): readonly string[] {
  return EMPTY;
}

export function dismissAd(creativeId: string): void {
  const current = read();
  if (current.includes(creativeId)) return;

  cached = [...current, creativeId];
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(cached));
    } catch {
      // Keep the dismissal for this tab even when persistence is unavailable.
    }
  }
  notify();
}

export function clearDismissedAds(): void {
  cached = EMPTY;
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(DISMISSED_KEY);
    } catch {
      // Ignore an unavailable store.
    }
  }
  notify();
}
