/**
 * Test stand-in for the `server-only` marker.
 *
 * The real package throws when it is resolved outside a React Server Component.
 * Unit tests import server modules directly, so Vite aliases the marker to this
 * no-op module (see `vitest.config.mts`).
 */
export {};
