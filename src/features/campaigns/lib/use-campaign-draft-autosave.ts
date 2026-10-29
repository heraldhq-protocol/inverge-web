"use client";

import { useEffect, useRef, useState } from "react";

import {
  readSavedDraft,
  toCreateDraftPayload,
  type DraftReadiness,
} from "@/features/campaigns/lib/draft-api";
import type { DraftApplicationFee } from "@/features/campaigns/lib/application-fee";
import type { CampaignDraft } from "@/features/campaigns/lib/wizard";

/**
 * Autosave for the creator's draft.
 *
 * The server is the source of truth: a save carries the version it read, the API
 * applies it conditionally, and a `409` stops the loop rather than overwriting a
 * newer edit from another tab. Nothing is optimistically marked saved.
 *
 * Saves are serialised. A second edit made while a save is in flight waits for
 * that save to answer, then reads the version it produced — so a burst of typing
 * cannot send two requests with the same version and turn one into a conflict.
 *
 * Saving begins as soon as the document is one the API can create. Until then the
 * hook reports why, instead of posting half a campaign and inventing the missing
 * fields.
 */

export type DraftSaveStatus =
  "idle" | "waiting" | "saving" | "saved" | "error" | "conflict" | "signed-out";

export type DraftSaveState = {
  status: DraftSaveStatus;
  draftId: string | null;
  version: number | null;
  readiness: DraftReadiness | null;
  applicationFee: DraftApplicationFee | null;
  reviewStatus: string | null;
  campaignStatus: string;
  /**
   * True while an edit has not yet been confirmed by a save response. The
   * review step uses this to refuse payment or submission against stale data.
   */
  isDirty: boolean;
  message: string | null;
  savedAt: string | null;
};

export type DraftSaveInitial = {
  id: string;
  version: number;
  readiness: DraftReadiness | null;
  applicationFee: DraftApplicationFee | null;
  reviewStatus: string | null;
  campaignStatus: string;
} | null;

export type DraftSaveOptions = {
  draft: CampaignDraft;
  enabled: boolean;
  initial: DraftSaveInitial;
  /** Called once, when a create response makes the draft resumable by URL. */
  onCreated?: (id: string) => void;
  debounceMs?: number;
};

const DEFAULT_DEBOUNCE_MS = 1_200;
const REQUEST_TIMEOUT_MS = 15_000;

export function useCampaignDraftAutosave({
  debounceMs = DEFAULT_DEBOUNCE_MS,
  draft,
  enabled,
  initial,
  onCreated,
}: DraftSaveOptions): DraftSaveState {
  const [state, setState] = useState<DraftSaveState>(() => ({
    applicationFee: initial?.applicationFee ?? null,
    campaignStatus: initial?.campaignStatus ?? "DRAFT",
    draftId: initial?.id ?? null,
    isDirty: false,
    message: null,
    readiness: initial?.readiness ?? null,
    reviewStatus: initial?.reviewStatus ?? null,
    savedAt: null,
    status: initial?.id ? "saved" : "idle",
    version: initial?.version ?? null,
  }));

  const idRef = useRef<string | null>(initial?.id ?? null);
  const versionRef = useRef<number | null>(initial?.version ?? null);
  const mountedRef = useRef(true);
  const blockedRef = useRef(false);
  const onCreatedRef = useRef(onCreated);
  const firstRunRef = useRef(true);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const revisionRef = useRef(0);

  useEffect(() => {
    onCreatedRef.current = onCreated;
  }, [onCreated]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // The first render is the draft as it was loaded, not an edit.
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }

    if (blockedRef.current) return;

    const revision = revisionRef.current + 1;
    revisionRef.current = revision;
    setState((current) =>
      current.isDirty ? current : { ...current, isDirty: true },
    );

    const snapshot = draft;
    const timer = setTimeout(() => {
      queueRef.current = queueRef.current
        .then(async () => {
          if (!mountedRef.current || blockedRef.current) return;

          const ready = toCreateDraftPayload(snapshot);
          if (!ready.ok) {
            setState((current) => ({
              ...current,
              message:
                ready.issues[0]?.message ??
                "Finish the plan before this draft can be saved.",
              status: "waiting",
            }));
            return;
          }

          const id = idRef.current;
          const version = versionRef.current;
          const body = ready.payload;

          setState((current) => ({
            ...current,
            message: null,
            status: "saving",
          }));

          let response: Response;
          try {
            response = await fetch(
              id
                ? `/api/campaigns/${encodeURIComponent(id)}`
                : "/api/campaigns",
              {
                body: JSON.stringify(
                  id ? { ...body, version: version ?? 0 } : body,
                ),
                cache: "no-store",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                method: id ? "PATCH" : "POST",
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
              },
            );
          } catch {
            if (!mountedRef.current) return;
            setState((current) => ({
              ...current,
              message:
                "The save could not reach Inverge. Your draft is still here.",
              status: "error",
            }));
            return;
          }

          const payload = (await response.json().catch(() => null)) as unknown;

          if (!mountedRef.current) return;

          if (!response.ok) {
            const envelope = payload as {
              error?: { code?: unknown; message?: unknown; details?: unknown };
            } | null;
            const code =
              typeof envelope?.error?.code === "string"
                ? envelope.error.code
                : "SAVE_FAILED";
            const message =
              typeof envelope?.error?.message === "string"
                ? envelope.error.message
                : "The draft could not be saved.";

            if (response.status === 401) {
              blockedRef.current = true;
              setState((current) => ({
                ...current,
                message: "Sign in again to keep saving this draft.",
                status: "signed-out",
              }));
              return;
            }

            if (code === "STALE_DRAFT_VERSION" || response.status === 409) {
              blockedRef.current = true;
              const details = envelope?.error?.details as
                { currentVersion?: unknown } | undefined;
              const currentVersion =
                typeof details?.currentVersion === "number"
                  ? details.currentVersion
                  : null;
              setState((current) => ({
                ...current,
                message:
                  currentVersion === null
                    ? "This draft was changed somewhere else. Reload before saving again."
                    : `This draft was changed somewhere else (now version ${currentVersion}). Reload before saving again.`,
                status: "conflict",
              }));
              return;
            }

            setState((current) => ({ ...current, message, status: "error" }));
            return;
          }

          const saved = readSavedDraft(payload);
          if (!saved) {
            setState((current) => ({
              ...current,
              message:
                "Inverge saved the draft but returned an unexpected response.",
              status: "error",
            }));
            return;
          }

          const created = idRef.current === null;
          idRef.current = saved.id;
          versionRef.current = saved.version;
          setState({
            applicationFee: saved.applicationFee,
            campaignStatus: saved.status,
            draftId: saved.id,
            isDirty: revisionRef.current !== revision,
            message: null,
            readiness: saved.readiness,
            reviewStatus: saved.reviewStatus,
            savedAt: new Date().toISOString(),
            status: "saved",
            version: saved.version,
          });

          if (created) onCreatedRef.current?.(saved.id);
        })
        .catch(() => {
          // A failed save must not poison the queue: the next edit retries.
        });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [debounceMs, draft, enabled]);

  return state;
}
