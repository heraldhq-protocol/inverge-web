/**
 * Cookie names shared by the server session helpers and the edge middleware.
 *
 * They live outside `features/auth/server` so the proxy can read the session
 * cookie without importing a `server-only` module that depends on `next/headers`.
 */
export const SESSION_COOKIE_NAME = "inverge_session";
export const ONBOARDING_INTENT_COOKIE_NAME = "inverge_onboarding_intent";
