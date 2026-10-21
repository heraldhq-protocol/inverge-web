import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clearOnboardingIntent = vi.hoisted(() => vi.fn(async () => undefined));
const readOnboardingIntent = vi.hoisted(() => vi.fn(async () => "general"));
const readSessionToken = vi.hoisted(() =>
  vi.fn(async (): Promise<string | null> => "session-jwt"),
);
const previewMode = vi.hoisted(() => ({ value: false }));
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
  readPreviewSession,
  writePreviewSession,
}));
vi.mock("@/features/auth/server/session", () => ({
  clearOnboardingIntent,
  readOnboardingIntent,
  readSessionToken,
}));
vi.mock("@/features/auth/server/session-user", () => ({
  apiBaseUrl: () => apiBase.value,
}));

import { PATCH } from "@/app/api/auth/profile/route";

const APP_ORIGIN = "https://inverge.africa";

function saveRequest(
  body: unknown,
  { origin = APP_ORIGIN as string | null } = {},
): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);

  return new Request(`${APP_ORIGIN}/api/auth/profile`, {
    body: JSON.stringify(body),
    headers,
    method: "PATCH",
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
  clearOnboardingIntent.mockClear();
  readOnboardingIntent.mockReset();
  readOnboardingIntent.mockResolvedValue("general");
  readSessionToken.mockReset();
  readSessionToken.mockResolvedValue("session-jwt");
  readPreviewSession.mockReset();
  readPreviewSession.mockResolvedValue(null);
  writePreviewSession.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PATCH /api/auth/profile", () => {
  it("refuses a request that did not come from this app", async () => {
    const response = await PATCH(
      saveRequest(
        { displayName: "Amara", username: "amara" },
        { origin: "https://evil.test" },
      ),
    );

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unconfigured API instead of guessing an address", async () => {
    apiBase.value = null;

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a session", async () => {
    readSessionToken.mockResolvedValue(null);

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed profile before calling the API", async () => {
    const response = await PATCH(
      saveRequest({ displayName: "", username: "a" }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the cookie as a bearer token and normalises the handle", async () => {
    fetchMock.mockResolvedValue(upstream({ id: "usr_123" }));

    const response = await PATCH(
      saveRequest({ displayName: "  Amara  ", username: "Amara_OK" }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/me/profile",
      expect.objectContaining({
        body: JSON.stringify({ displayName: "Amara", username: "amara_ok" }),
        headers: {
          Authorization: "Bearer session-jwt",
          "Content-Type": "application/json",
        },
        method: "PATCH",
      }),
    );
    expect(await response.json()).toEqual({ nextPath: "/onboarding/role" });
  });

  it("continues creator intent into the shared starting-point question", async () => {
    readOnboardingIntent.mockResolvedValue("creator");
    fetchMock.mockResolvedValue(upstream({ id: "usr_123" }));

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(await response.json()).toEqual({
      nextPath: "/onboarding/role?intent=creator",
    });
    expect(clearOnboardingIntent).toHaveBeenCalledTimes(1);
  });

  it("maps a duplicate handle to a field-specific conflict", async () => {
    fetchMock.mockResolvedValue(
      upstream({ message: "This username is already taken" }, 400),
    );

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "username_taken" });
    expect(clearOnboardingIntent).not.toHaveBeenCalled();
  });

  it("keeps an unrelated rejection generic", async () => {
    fetchMock.mockResolvedValue(
      upstream({ message: "Moderation rejected the display name" }, 400),
    );

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "profile_rejected" });
  });

  it("reports an expired session without clearing anything", async () => {
    fetchMock.mockResolvedValue(upstream({ message: "Unauthorized" }, 401));

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "session_expired" });
    expect(clearOnboardingIntent).not.toHaveBeenCalled();
  });

  it("tells the client to retry when the API is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "api_unreachable" });
  });

  it("stores the profile locally in preview mode", async () => {
    previewMode.value = true;
    readPreviewSession.mockResolvedValue({
      v: 1,
      subject: "b".repeat(64),
      accountType: null,
      contactName: null,
      displayName: null,
      username: null,
    });

    const response = await PATCH(
      saveRequest({
        accountType: "individual",
        displayName: "  Amara  ",
        username: "Amara_OK",
      }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(readSessionToken).not.toHaveBeenCalled();
    expect(writePreviewSession).toHaveBeenCalledWith({
      v: 1,
      subject: "b".repeat(64),
      accountType: "individual",
      contactName: null,
      displayName: "Amara",
      username: "amara_ok",
    });
    expect(clearOnboardingIntent).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ nextPath: "/onboarding/role" });
  });

  it("stores a business name and contact in preview mode", async () => {
    previewMode.value = true;
    readPreviewSession.mockResolvedValue({
      v: 1,
      subject: "b".repeat(64),
      accountType: null,
      contactName: null,
      displayName: null,
      username: null,
    });

    const response = await PATCH(
      saveRequest({
        accountType: "business",
        contactName: "  Amara Okonkwo ",
        displayName: " Amara Studio ",
        username: "amara-studio",
      }),
    );

    expect(writePreviewSession).toHaveBeenCalledWith({
      v: 1,
      subject: "b".repeat(64),
      accountType: "business",
      contactName: "Amara Okonkwo",
      displayName: "Amara Studio",
      username: "amara-studio",
    });
    expect(await response.json()).toEqual({ nextPath: "/onboarding/role" });
  });

  it("refuses a preview business without a contact name", async () => {
    previewMode.value = true;
    readPreviewSession.mockResolvedValue({
      v: 1,
      subject: "b".repeat(64),
      accountType: null,
      contactName: null,
      displayName: null,
      username: null,
    });

    const response = await PATCH(
      saveRequest({
        accountType: "business",
        displayName: "Amara Studio",
        username: "amara-studio",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_body" });
    expect(writePreviewSession).not.toHaveBeenCalled();
  });

  it("refuses a preview profile without an account type", async () => {
    previewMode.value = true;
    readPreviewSession.mockResolvedValue({
      v: 1,
      subject: "b".repeat(64),
      accountType: null,
      contactName: null,
      displayName: null,
      username: null,
    });

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(400);
    expect(writePreviewSession).not.toHaveBeenCalled();
  });

  it("drops preview-only fields before calling the live API", async () => {
    fetchMock.mockResolvedValue(upstream({ id: "usr_123" }));

    await PATCH(
      saveRequest({
        accountType: "business",
        contactName: "Amara",
        displayName: "Amara Studio",
        username: "amara-studio",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/me/profile",
      expect.objectContaining({
        body: JSON.stringify({
          displayName: "Amara Studio",
          username: "amara-studio",
        }),
      }),
    );
  });

  it("continues creator intent in preview mode", async () => {
    previewMode.value = true;
    readPreviewSession.mockResolvedValue({
      v: 1,
      subject: "b".repeat(64),
      accountType: null,
      contactName: null,
      displayName: null,
      username: null,
    });
    readOnboardingIntent.mockResolvedValue("creator");

    const response = await PATCH(
      saveRequest({
        accountType: "individual",
        displayName: "Amara",
        username: "amara",
      }),
    );

    expect(await response.json()).toEqual({
      nextPath: "/onboarding/role?intent=creator",
    });
  });

  it("asks for a new preview sign-in when the local identity is gone", async () => {
    previewMode.value = true;

    const response = await PATCH(
      saveRequest({ displayName: "Amara", username: "amara" }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "session_expired" });
    expect(writePreviewSession).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
