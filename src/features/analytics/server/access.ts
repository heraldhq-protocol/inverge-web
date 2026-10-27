import "server-only";

import { cache } from "react";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl, isApiConfigured } from "@/lib/api/server";

import {
  toAnalyticsAccessView,
  type AnalyticsAccessView,
} from "@/features/analytics/lib/access";

const ACCESS_TIMEOUT_MS = 3_000;

/**
 * Reads the signed-in account's premium-analytics entitlement.
 *
 * This is deliberately separate from collection: the dashboard can show a
 * request button even when reports are empty, and a malformed or unavailable
 * access response never becomes a false approval. The API is the only authority
 * on the grant; the web renders its projection.
 */
export const getAnalyticsAccess = cache(
  async (): Promise<AnalyticsAccessView> => {
    if (isPreviewAuth() || !isApiConfigured()) {
      return { status: "not_configured" };
    }

    const token = await readSessionToken();
    if (!token) return { status: "signed_out" };

    const base = apiBaseUrl();
    if (!base) return { status: "not_configured" };

    let response: Response;
    try {
      response = await fetch(`${base}/analytics/access`, {
        cache: "no-store",
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(ACCESS_TIMEOUT_MS),
      });
    } catch {
      return {
        reason: "We could not reach the analytics service. Try again.",
        status: "unavailable",
      };
    }

    if (response.status === 401) return { status: "signed_out" };
    if (response.status === 404) return { status: "not_configured" };
    if (!response.ok) {
      return {
        reason:
          response.status >= 500
            ? "The analytics service is temporarily unavailable. Try again."
            : "We could not check premium access for this account.",
        status: "unavailable",
      };
    }

    try {
      return toAnalyticsAccessView(await response.json());
    } catch {
      return {
        reason: "The analytics service returned an unexpected response.",
        status: "unavailable",
      };
    }
  },
);
