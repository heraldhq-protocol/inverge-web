import "server-only";

import { createHmac, randomUUID } from "node:crypto";

import { cookies, headers } from "next/headers";
import { after } from "next/server";

import { ANALYTICS_SESSION_COOKIE } from "@/features/analytics/lib/session";
import { readSessionToken } from "@/features/auth/server/session";
import { readSessionUser } from "@/features/auth/server/session-user";
import { apiBaseUrl } from "@/lib/api/server";

/**
 * Server-side product analytics producer.
 *
 * The Next.js server observes the render and calls the API's signed ingest route
 * after the response has been sent. There is no browser client, no public ingest
 * endpoint, and no client-controlled identity: the secret stays on the server and
 * a failure is logged and dropped so analytics can never block a page or a
 * product action.
 */

export const ANALYTICS_PAGE_KEYS = [
  "home",
  "ideas",
  "idea-detail",
  "campaigns",
  "campaign-detail",
  "creator-dashboard",
  "settings",
  "notifications",
  "auth",
] as const;

export type AnalyticsPageKey = (typeof ANALYTICS_PAGE_KEYS)[number];
export type AnalyticsSource = "feed" | "search" | "direct" | "internal";

type NewAnalyticsEvent =
  | {
      name: "page_viewed";
      resourceType: "PAGE";
      resourceId: AnalyticsPageKey;
      source?: AnalyticsSource;
    }
  | {
      name: "idea_viewed";
      ideaId: string;
      source?: AnalyticsSource;
      position?: number;
    }
  | {
      name: "campaign_viewed";
      campaignId: string;
      source?: AnalyticsSource;
      position?: number;
    }
  | {
      name: "campaign_step_started";
      campaignId: string;
      step: string;
    }
  | {
      name: "campaign_step_completed";
      campaignId: string;
      step: string;
      durationMs: number;
    };

type PreparedAnalyticsEvent = NewAnalyticsEvent & {
  eventKey: string;
  occurredAt: string;
};

type AnalyticsIdentity = { userId: string } | { sessionId: string };

const MAX_EVENTS_PER_BATCH = 50;
const REQUEST_TIMEOUT_MS = 2_000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9:_-]{1,64}$/;

function ingestSecret(): string | null {
  const secret = process.env.INVERGE_ANALYTICS_INGEST_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

export function isAnalyticsIngestConfigured(): boolean {
  return (
    process.env.INVERGE_ANALYTICS_ENABLED === "true" &&
    ingestSecret() !== null &&
    apiBaseUrl() !== null
  );
}

/**
 * HMAC-SHA256 over `${timestamp}.${rawBody}`, lowercase hex. Exported so a unit
 * test can pin the exact contract the API verifies.
 */
export function signAnalyticsBody(
  secret: string,
  timestamp: string,
  rawBody: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
}

function countryCodeFromHeaders(
  requestHeaders: Headers,
): string | undefined {
  // Only trust the header a hosting edge sets. A self-hosted origin would let a
  // client supply `x-vercel-ip-country` itself, so absence of a known edge is
  // treated as "no geography" rather than as authoritative data.
  const raw =
    process.env.VERCEL === "1"
      ? requestHeaders.get("x-vercel-ip-country")
      : process.env.CF_PAGES === "1"
        ? requestHeaders.get("cf-ipcountry")
        : null;
  return raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : undefined;
}

async function rejectedEventCount(response: Response): Promise<number> {
  try {
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("rejected" in payload)) {
      return 0;
    }
    const rejected = (payload as { rejected?: unknown }).rejected;
    return Array.isArray(rejected) ? rejected.length : 0;
  } catch {
    return 0;
  }
}

type AnalyticsContext = {
  identity: AnalyticsIdentity | null;
  countryCode: string | undefined;
};

/**
 * Captures request-scoped data before `after()` runs.
 *
 * Next.js forbids calling `cookies()` or `headers()` inside an `after()` callback.
 * The promises are created during the render, so the values are already captured
 * by the time the post-response hook reads them.
 */
function resolveAnalyticsContext(): Promise<AnalyticsContext> {
  const token = readSessionToken();
  const user = readSessionUser();
  const visitor = cookies();
  const requestHeaders = headers();

  return (async () => {
    let identity: AnalyticsIdentity | null = null;
    if (await token) {
      const sessionUser = await user;
      if (sessionUser?.mode === "live") identity = { userId: sessionUser.id };
    }
    if (!identity) {
      const visitorId = (await visitor).get(ANALYTICS_SESSION_COOKIE)?.value;
      if (visitorId && SESSION_ID_PATTERN.test(visitorId)) {
        identity = { sessionId: visitorId };
      }
    }

    let countryCode: string | undefined;
    try {
      countryCode = countryCodeFromHeaders(await requestHeaders);
    } catch {
      countryCode = undefined;
    }

    return { identity, countryCode };
  })();
}

function toWireEvent(
  event: PreparedAnalyticsEvent,
  identity: AnalyticsIdentity,
  countryCode: string | undefined,
): Record<string, unknown> {
  return {
    ...event,
    ...identity,
    ...(countryCode ? { countryCode } : {}),
  };
}

/**
 * Sends one batch. Never throws: the caller is a post-response hook, and a
 * dropped event is preferable to a failed render or a retried user action.
 */
export async function sendAnalyticsEvents(
  events: readonly PreparedAnalyticsEvent[],
  context: AnalyticsContext,
): Promise<void> {
  if (events.length === 0) return;

  const secret = ingestSecret();
  const base = apiBaseUrl();
  const identity = context.identity;
  if (!secret || !base || !identity) return;

  const body = JSON.stringify({
    events: events
      .slice(0, MAX_EVENTS_PER_BATCH)
      .map((event) => toWireEvent(event, identity, context.countryCode)),
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signAnalyticsBody(secret, timestamp, body);

  let lastStatus: number | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${base}/internal/analytics/events`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          "x-inverge-timestamp": timestamp,
          "x-inverge-signature": signature,
        },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) {
        const rejected = await rejectedEventCount(response);
        if (rejected > 0) {
          console.warn("[analytics] ingest rejected events", {
            count: rejected,
          });
        }
        return;
      }
      lastStatus = response.status;
      if (response.status !== 503) break;
    } catch {
      // A network failure or timeout is retried once with the same keys.
      lastStatus = null;
    }
  }

  // No payload, identity, or secret is logged: only the batch size and status.
  console.warn("[analytics] ingest dropped", {
    events: events.length,
    status: lastStatus ?? "network",
  });
}

/**
 * Schedules events after the response. Call sites never await a network call.
 *
 * `after` preserves the request context, so the identity and country are
 * resolved without delaying the page. If it is unavailable (for example in a
 * unit test), the batch is sent best-effort instead of throwing.
 */
export function recordAnalytics(events: readonly NewAnalyticsEvent[]): void {
  if (!isAnalyticsIngestConfigured() || events.length === 0) return;

  const prepared: PreparedAnalyticsEvent[] = events.map((event) => ({
    ...event,
    eventKey: randomUUID(),
    occurredAt: new Date().toISOString(),
  }));

  let context: Promise<AnalyticsContext>;
  try {
    context = resolveAnalyticsContext();
  } catch {
    return;
  }

  const send = async () => {
    try {
      const resolved = await context;
      if (!resolved.identity) return;
      await sendAnalyticsEvents(prepared, resolved);
    } catch {
      // Analytics is best-effort and must never surface from a page render.
    }
  };

  try {
    after(send);
  } catch {
    void send();
  }
}

export function recordPageView(
  pageKey: AnalyticsPageKey,
  options: { source?: AnalyticsSource } = {},
): void {
  recordAnalytics([
    {
      name: "page_viewed",
      resourceId: pageKey,
      resourceType: "PAGE",
      ...(options.source ? { source: options.source } : {}),
    },
  ]);
}

export function recordIdeaView(
  ideaId: string,
  options: { source?: AnalyticsSource; position?: number } = {},
): void {
  recordAnalytics([
    {
      ideaId,
      name: "idea_viewed",
      ...(options.source ? { source: options.source } : {}),
      ...(options.position !== undefined ? { position: options.position } : {}),
    },
  ]);
}

export function recordCampaignView(
  campaignId: string,
  options: { source?: AnalyticsSource; position?: number } = {},
): void {
  recordAnalytics([
    {
      campaignId,
      name: "campaign_viewed",
      ...(options.source ? { source: options.source } : {}),
      ...(options.position !== undefined ? { position: options.position } : {}),
    },
  ]);
}

export function recordCampaignStep(
  event:
    | { phase: "started"; campaignId: string; step: string }
    | {
        phase: "completed";
        campaignId: string;
        step: string;
        durationMs: number;
      },
): void {
  recordAnalytics([
    event.phase === "started"
      ? {
          campaignId: event.campaignId,
          name: "campaign_step_started",
          step: event.step,
        }
      : {
          campaignId: event.campaignId,
          durationMs: event.durationMs,
          name: "campaign_step_completed",
          step: event.step,
        },
  ]);
}

export function parseAnalyticsSource(
  value: string | string[] | undefined,
): AnalyticsSource {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "feed" || raw === "search" || raw === "internal"
    ? raw
    : "direct";
}
