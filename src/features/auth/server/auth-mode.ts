import "server-only";

export type AuthMode = "api" | "preview";

/**
 * Preview auth keeps the real provider sign-in but stores a local identity
 * instead of exchanging the provider token for an Inverge session.
 *
 * It exists so UI work can continue while the API wiring is unfinished. It is
 * never enabled in production: a production deployment that sets
 * `INVERGE_AUTH_MODE=preview` still talks to the API. The preview identity is
 * not a credential and grants no backend authority.
 */
export function authMode(): AuthMode {
  if (process.env.NODE_ENV === "production") return "api";
  return process.env.INVERGE_AUTH_MODE === "preview" ? "preview" : "api";
}

export function isPreviewAuth(): boolean {
  return authMode() === "preview";
}
