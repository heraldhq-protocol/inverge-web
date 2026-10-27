"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { apiBaseUrl, isApiConfigured } from "@/lib/api/server";

const REQUEST_TIMEOUT_MS = 3_000;
const RETURN_PATH = "/d/creator/analytics";

/**
 * Submits a premium-analytics access request for the signed-in account.
 *
 * The API is idempotent: a pending request or an active approval is returned
 * unchanged. The action never decides the outcome locally, and it never invents
 * a plan or a price. A redirect keeps the form safe to retry and gives the page
 * one honest notice to render.
 */
export async function requestAnalyticsAccess(): Promise<void> {
  if (isPreviewAuth() || !isApiConfigured()) {
    redirect(`${RETURN_PATH}?access=error`);
  }

  const [token, base] = [await readSessionToken(), apiBaseUrl()];
  if (!token || !base) redirect(`${RETURN_PATH}?access=error`);

  let response: Response;
  try {
    response = await fetch(`${base}/analytics/access-requests`, {
      method: "POST",
      cache: "no-store",
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    redirect(`${RETURN_PATH}?access=error`);
  }

  if (response.status === 401) {
    redirect(`/auth?next=${encodeURIComponent(RETURN_PATH)}`);
  }
  if (!response.ok) redirect(`${RETURN_PATH}?access=error`);

  revalidatePath(RETURN_PATH);
  redirect(`${RETURN_PATH}?access=requested`);
}
