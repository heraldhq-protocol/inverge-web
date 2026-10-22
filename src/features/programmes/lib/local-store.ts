import type { Programme } from "@/features/programmes/types";

const STORE_KEY = "inverge:programmes:local";
const DRAFT_PREFIX = "inverge:programme-draft:";

/**
 * Browser-only preview store for the admin workspace.
 *
 * There is no authenticated API session in this repository. Keeping the
 * boundary in one module means the swap to server actions is explicit and the
 * UI can state, accurately, that nothing was persisted remotely.
 */

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readLocalProgrammes(): Programme[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Programme[]) : [];
  } catch {
    return [];
  }
}

/**
 * `useSyncExternalStore` requires a stable snapshot reference between reads.
 * The cache is invalidated on every write and on cross-tab `storage` events so
 * subscribers see changes without a re-render loop.
 */
const EMPTY: Programme[] = [];
let snapshotCache: Programme[] | null = null;
const storeListeners = new Set<() => void>();

function invalidateSnapshot(): void {
  snapshotCache = null;
  for (const listener of storeListeners) listener();
}

export function getLocalProgrammesSnapshot(): Programme[] {
  if (!canUseStorage()) return EMPTY;
  if (snapshotCache === null) snapshotCache = readLocalProgrammes();
  return snapshotCache;
}

export function getServerProgrammesSnapshot(): Programme[] {
  return EMPTY;
}

export function subscribeLocalProgrammes(listener: () => void): () => void {
  if (!canUseStorage()) return () => {};
  storeListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORE_KEY) invalidateSnapshot();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    storeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function saveLocalProgramme(programme: Programme): void {
  if (!canUseStorage()) return;
  try {
    const existing = readLocalProgrammes().filter(
      (entry) => entry.id !== programme.id,
    );
    window.localStorage.setItem(
      STORE_KEY,
      JSON.stringify([...existing, programme]),
    );
    invalidateSnapshot();
  } catch {
    // A full or disabled store must not block the editor.
  }
}

export function readWizardDraft(id: string): Programme | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(`${DRAFT_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as Programme) : null;
  } catch {
    return null;
  }
}

const DRAFT_NONE = null as Programme | null;
const draftCache = new Map<string, Programme | null>();

export function getWizardDraftSnapshot(id: string): Programme | null {
  if (!canUseStorage()) return DRAFT_NONE;
  if (!draftCache.has(id)) draftCache.set(id, readWizardDraft(id));
  return draftCache.get(id) ?? DRAFT_NONE;
}

export function getServerWizardDraftSnapshot(): Programme | null {
  return DRAFT_NONE;
}

export function subscribeWizardDraft(
  id: string,
  listener: () => void,
): () => void {
  if (!canUseStorage()) return () => {};
  const key = `${DRAFT_PREFIX}${id}`;
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    draftCache.delete(id);
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function saveWizardDraft(programme: Programme): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(
      `${DRAFT_PREFIX}${programme.id}`,
      JSON.stringify(programme),
    );
    draftCache.set(programme.id, programme);
  } catch {
    // Ignore storage failure.
  }
}

export function removeWizardDraft(id: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(`${DRAFT_PREFIX}${id}`);
    draftCache.delete(id);
  } catch {
    // Ignore.
  }
}

export function mergeProgrammes(
  base: readonly Programme[],
  local: readonly Programme[],
): Programme[] {
  const byId = new Map(base.map((programme) => [programme.id, programme]));
  for (const programme of local) byId.set(programme.id, programme);
  return [...byId.values()].toSorted(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}
