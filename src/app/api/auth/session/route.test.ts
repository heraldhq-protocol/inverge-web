import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const writeSessionCookie = vi.hoisted(() => vi.fn(async () => undefined));
const clearSessionCookie = vi.hoisted(() => vi.fn(async () => undefined));
const writeOnboardingIntent = vi.hoisted(() => vi.fn(async () => undefined));
const writeEmailHint = vi.hoisted(() => vi.fn(async () => undefined));
const previewMode = vi.hoisted(() => ({ value: false }));
const previewSubjectFromIdToken = vi.hoisted(() =>
  vi.fn((token: string) => (token === "valid-preview" ? "a".repeat(64) : null)),
);
const readPreviewSession = vi.hoisted(() =>
  vi.fn(
    async (): Promise<{
      v: 1;
      subject: string;
      accountType: "individual" | "business" | null;
      contactName: string | null;
      displayName: string | null;
      username: string | null;
    } | null> => null,
  ),
);
const writePreviewSession = vi.hoisted(() => vi.fn(async () => undefined));
const apiBase = vi.hoisted(() => ({
  value: "https://api.inverge.test" as string | null,
}));

vi.mock("@/features/auth/server/auth-mode", () => ({
  isPreviewAuth: () => previewMode.value,
}));
vi.mock("@/features/auth/server/preview-session", () => ({
  previewSubjectFromIdToken,
  readPreviewSession,
  writePreviewSession,
}));
vi.mock("@/features/auth/server/session", () => ({
  clearSessionCookie,
  writeEmailHint,
  writeOnboardingIntent,
  writeSessionCookie,
}));
vi.mock("@/features/auth/server/session-user", () => ({
  apiBaseUrl: () => apiBase.value,
}));

import { POST } from "@/app/api/auth/session/route";

const APP_ORIGIN = "https://inverge.africa";

function exchangeRequest(
  body: unknown,
  { origin = APP_ORIGIN as string | null } = {},
): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);

  return new Request(`${APP_ORIGIN}/api/auth/session`, {
    body: JSON.stringify(body),
    headers,
    method: "POST",
  });
}

function upstream(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  apiBase.value = "https://api.inverge.test";
  previewMode.value = false;
  fetchMock.mockReset();
  writeSessionCookie.mockClear();
  clearSessionCookie.mockClear();
  writeOnboardingIntent.mockClear();
  writeEmailHint.mockClear();
  previewSubjectFromIdToken.mockClear();
  readPreviewSession.mockReset();
  readPreviewSession.mockResolvedValue(null);
  writePreviewSession.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/auth/session", () => {
  it("refuses a request that did not come from this app", async () => {
    const response = await POST(
      exchangeRequest({ idToken: "id-token" }, { origin: "https://evil.test" }),
    );

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(writeSessionCookie).not.toHaveBeenCalled();
  });

  it("refuses a request with no origin", async () => {
    const response = await POST(
      exchangeRequest({ idToken: "id-token" }, { origin: null }),
    );

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unconfigured API instead of guessing an address", async () => {
    apiBase.value = null;

    const response = await POST(exchangeRequest({ idToken: "id-token" }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "api_not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a body without an identity token", async () => {
    const response = await POST(exchangeRequest({ walletAddress: "x" }));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stores the session in a cookie and never returns the token", async () => {
    fetchMock.mockResolvedValue(
      upstream({ requiresOnboarding: false, sessionToken: "session-jwt" }),
    );

    const response = await POST(
      exchangeRequest({
        idToken: "id-token",
        walletAddress: "So11111111111111111111111111111111111111112",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/session",
      expect.objectContaining({
        body: JSON.stringify({
          accessToken: "id-token",
          walletAddress: "So11111111111111111111111111111111111111112",
        }),
        method: "POST",
      }),
    );
    expect(writeSessionCookie).toHaveBeenCalledWith("session-jwt");
    expect(writeEmailHint).toHaveBeenCalledWith(null);
    expect(writeOnboardingIntent).toHaveBeenCalledWith("general");

    const payload = await response.text();
    expect(JSON.parse(payload)).toEqual({
      requiresEmailVerification: false,
      requiresOnboarding: false,
    });
    expect(payload).not.toContain("session-jwt");
  });

  it("keeps creator intent on this side of the BFF", async () => {
    fetchMock.mockResolvedValue(
      upstream({ requiresOnboarding: true, sessionToken: "session-jwt" }),
    );

    const response = await POST(
      exchangeRequest({ idToken: "id-token", intent: "creator" }),
    );

    // The API never sees a routing hint and cannot act on one.
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/session",
      expect.objectContaining({
        body: JSON.stringify({ accessToken: "id-token" }),
      }),
    );
    expect(writeOnboardingIntent).toHaveBeenCalledWith("creator");
    expect(await response.json()).toEqual({
      requiresEmailVerification: false,
      requiresOnboarding: true,
    });
  });

  it("stores an unproven provider address only as a prefill hint", async () => {
    fetchMock.mockResolvedValue(
      upstream({
        requiresEmailVerification: true,
        requiresOnboarding: true,
        sessionToken: "session-jwt",
        suggestedEmail: "Amara@Example.test",
      }),
    );

    const response = await POST(exchangeRequest({ idToken: "id-token" }));

    expect(writeEmailHint).toHaveBeenCalledWith("Amara@Example.test");
    expect(await response.json()).toEqual({
      requiresEmailVerification: true,
      requiresOnboarding: true,
    });
  });

  it("rejects an intent outside the supported doors", async () => {
    const response = await POST(
      exchangeRequest({ idToken: "id-token", intent: "admin" }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(writeOnboardingIntent).not.toHaveBeenCalled();
  });

  it("reports a rejected identity as an authentication failure", async () => {
    fetchMock.mockResolvedValue(upstream({ message: "Unauthorized" }, 401));

    const response = await POST(exchangeRequest({ idToken: "forged" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "session_rejected" });
    expect(writeSessionCookie).not.toHaveBeenCalled();
  });

  it("tells the client to retry when the API is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const response = await POST(exchangeRequest({ idToken: "id-token" }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "api_unreachable" });
    expect(writeSessionCookie).not.toHaveBeenCalled();
  });

  it("refuses to set a cookie when the API omits the session token", async () => {
    fetchMock.mockResolvedValue(upstream({ requiresOnboarding: false }));

    const response = await POST(exchangeRequest({ idToken: "id-token" }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "invalid_response" });
    expect(writeSessionCookie).not.toHaveBeenCalled();
  });

  it("stores a local preview identity without calling the API", async () => {
    previewMode.value = true;

    const response = await POST(
      exchangeRequest({ idToken: "valid-preview", intent: "creator" }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(writeSessionCookie).not.toHaveBeenCalled();
    expect(clearSessionCookie).toHaveBeenCalled();
    expect(writePreviewSession).toHaveBeenCalledWith({
      v: 1,
      subject: "a".repeat(64),
      accountType: null,
      contactName: null,
      displayName: null,
      username: null,
    });
    expect(writeEmailHint).toHaveBeenCalledWith(null);
    expect(writeOnboardingIntent).toHaveBeenCalledWith("creator");
    expect(await response.json()).toEqual({
      requiresEmailVerification: false,
      requiresOnboarding: true,
    });
  });

  it("keeps an existing preview profile for the same subject", async () => {
    previewMode.value = true;
    readPreviewSession.mockResolvedValue({
      v: 1,
      subject: "a".repeat(64),
      accountType: "individual",
      contactName: null,
      displayName: "Amara",
      username: "amara",
    });

    const response = await POST(exchangeRequest({ idToken: "valid-preview" }));

    expect(writePreviewSession).toHaveBeenCalledWith({
      v: 1,
      subject: "a".repeat(64),
      accountType: "individual",
      contactName: null,
      displayName: "Amara",
      username: "amara",
    });
    expect(await response.json()).toEqual({
      requiresEmailVerification: false,
      requiresOnboarding: false,
    });
  });

  it("asks an older preview profile for the missing account type", async () => {
    previewMode.value = true;
    readPreviewSession.mockResolvedValue({
      v: 1,
      subject: "a".repeat(64),
      accountType: null,
      contactName: null,
      displayName: "Amara",
      username: "amara",
    });

    const response = await POST(exchangeRequest({ idToken: "valid-preview" }));

    expect(await response.json()).toEqual({
      requiresEmailVerification: false,
      requiresOnboarding: true,
    });
  });

  it("rejects a preview token with no stable subject", async () => {
    previewMode.value = true;

    const response = await POST(exchangeRequest({ idToken: "not-a-jwt" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "session_rejected" });
    expect(writePreviewSession).not.toHaveBeenCalled();
    expect(writeSessionCookie).not.toHaveBeenCalled();
  });
});
