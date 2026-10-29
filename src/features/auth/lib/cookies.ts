/**
 * Cookie names shared by the server session helpers and the edge middleware.
 *
 * They live outside `features/auth/server` so the proxy can read the session
 * cookie without importing a `server-only` module that depends on `next/headers`.
 */
export const SESSION_COOKIE_NAME = "inverge_session";
export const ONBOARDING_INTENT_COOKIE_NAME = "inverge_onboarding_intent";
/**
 * Untrusted provider address, kept only to prefill the capture screen.
 *
 * It is written from the API's `suggestedEmail` field, never used as proof of
 * ownership, and cleared once verification succeeds or the session ends.
 */
export const EMAIL_HINT_COOKIE_NAME = "inverge_email_hint";

/**
 * Preview-only identity cookie. Kept here with the other cookie names so the
 * proxy can recognise a local development session without importing a
 * `server-only` module that depends on `next/headers`.
 */
export const PREVIEW_SESSION_COOKIE_NAME = "inverge_preview_session";
