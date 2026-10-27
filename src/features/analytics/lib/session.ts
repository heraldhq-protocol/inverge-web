/**
 * The anonymous analytics session cookie.
 *
 * This is a first-party, session-scoped random id. It is not a device
 * fingerprint, it is not joined to an account later, and it expires with the
 * browser session. Phase 1 has no consent banner because the API collects only
 * first-party, server-observed, aggregate events; Phase 2 measurement needs a
 * separate privacy decision before it can reuse this value.
 */
export const ANALYTICS_SESSION_COOKIE = "inverge_analytics_session";

/** Thirty minutes: long enough for a reading session, short enough to forget. */
export const ANALYTICS_SESSION_MAX_AGE_SECONDS = 30 * 60;
