import "server-only";

import { cookies } from "next/headers";

import {
  ONBOARDING_INTENT_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/features/auth/lib/cookies";
import {
  DEFAULT_ONBOARDING_INTENT,
  type OnboardingIntent,
  safeOnboardingIntent,
} from "@/features/auth/lib/onboarding";

export { ONBOARDING_INTENT_COOKIE_NAME, SESSION_COOKIE_NAME };

/**
 * The Inverge session, kept server-side.
 *
 * The API issues a one-hour HS256 session JWT. The browser never reads it: it
 * lives in an HttpOnly cookie and is attached to API calls by the server, so no
 * XSS on the page can copy a bearer token out of JavaScript or local storage.
 *
 * The API's session lives for one hour (`SessionService` signs `1h`). The cookie
 * must not outlive it, or the browser would keep sending a token the API has
 * already rejected — and the next request would look like a surprise sign-out.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60;

export async function readSessionToken(): Promise<string | null> {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return value ? value : null;
}

export async function writeSessionCookie(token: string): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    // `Secure` would make the cookie invisible on http://localhost, which is the
    // only way this app is served in development.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

/**
 * The door the visitor came through, kept for the life of the session only.
 *
 * This is not an authorisation claim. It is written on sign-in from a value the
 * server has already validated against a closed set, read by the onboarding
 * routes to choose a destination, and deleted as soon as the shared profile is
 * stored. It never selects a role, tier or capability.
 */
export async function readOnboardingIntent(): Promise<OnboardingIntent> {
  const value = (await cookies()).get(ONBOARDING_INTENT_COOKIE_NAME)?.value;
  return value ? safeOnboardingIntent(value) : DEFAULT_ONBOARDING_INTENT;
}

export async function writeOnboardingIntent(
  intent: OnboardingIntent,
): Promise<void> {
  const store = await cookies();

  store.set(ONBOARDING_INTENT_COOKIE_NAME, intent, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearOnboardingIntent(): Promise<void> {
  const store = await cookies();
  store.delete(ONBOARDING_INTENT_COOKIE_NAME);
}
