"use client";

import { getAdConsentSnapshot } from "@/features/advertising/lib/consent-store";
import { consentAllowsMeasurement } from "@/features/advertising/lib/consent";
import type { AdEventType } from "@/features/advertising/lib/events";
import type { AdPlacementId } from "@/features/advertising/types";

/**
 * Browser event dispatch.
 *
 * Nothing leaves the tab unless the deployment has enabled advertising
 * measurement (`NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED`) *and* the reader has
 * explicitly allowed measurement in `/advertising-preferences`. The random
 * session id is created for this tab and never joined to an account.
 *
 * A sent key is stored in `sessionStorage` so a re-render, a React strict-mode
 * replay, or a history restore cannot send the same event twice.
 */

const SESSION_KEY = "inverge:advertising-session:v1";
const SENT_KEY = "inverge:advertising-sent:v1";
const ENDPOINT = "/api/advertising/events";

/**
 * Read at call time, not module load, so a test can stub the environment and a
 * server render never evaluates a browser write.
 */
export function advertisingMeasurementEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_INVERGE_ADS_ANALYTICS_ENABLED?.trim().toLowerCase() ===
    "true"
  );
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto
      .randomUUID()
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, 32);
  }

  return Array.from({ length: 4 }, () =>
    Math.random().toString(36).slice(2, 10),
  )
    .join("")
    .slice(0, 32);
}

function sessionId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing;

    const created = `adv-${randomId()}`;
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return null;
  }
}

function sentKeys(): Set<string> {
  try {
    const raw = window.sessionStorage.getItem(SENT_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [],
    );
  } catch {
    return new Set();
  }
}

function rememberSent(key: string): void {
  try {
    const keys = sentKeys();
    keys.add(key);
    window.sessionStorage.setItem(
      SENT_KEY,
      JSON.stringify([...keys].slice(-80)),
    );
  } catch {
    // A full or disabled store means the server may see a duplicate. The route
    // de-duplicates by session and event key as well.
  }
}

/**
 * Send one advertising event, at most once per tab.
 *
 * Failure is silent: advertising measurement must never interrupt reading,
 * clicking, or a funding decision.
 */
export function trackAdEvent(
  type: AdEventType,
  creativeId: string,
  placementId: AdPlacementId,
): void {
  if (typeof window === "undefined") return;
  if (!advertisingMeasurementEnabled()) return;
  if (!consentAllowsMeasurement(getAdConsentSnapshot())) return;

  const session = sessionId();
  if (!session) return;

  const key = `${type}:${session}:${creativeId}:${placementId}`;
  if (sentKeys().has(key)) return;
  rememberSent(key);

  const payload = JSON.stringify({
    creativeId,
    occurredAt: new Date().toISOString(),
    placementId,
    sessionId: session,
    type,
  });

  void fetch(ENDPOINT, {
    body: payload,
    headers: { "content-type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => {
    // No retry: an accepted impression is not worth a second request.
  });
}
