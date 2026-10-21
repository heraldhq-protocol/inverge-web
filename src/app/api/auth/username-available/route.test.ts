import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const readSessionToken = vi.hoisted(() =>
  vi.fn(async (): Promise<string | null> => "session-jwt"),
);
const previewMode = vi.hoisted(() => ({ value: false }));
const apiBase = vi.hoisted(() => ({
  value: "https://api.inverge.test" as string | null,
}));

vi.mock("@/features/auth/server/auth-mode", () => ({
  isPreviewAuth: () => previewMode.value,
}));
vi.mock("@/features/auth/server/session", () => ({ readSessionToken }));
vi.mock("@/features/auth/server/session-user", () => ({
  apiBaseUrl: () => apiBase.value,
}));

import { GET } from "@/app/api/auth/username-available/route";

const APP_ORIGIN = "https://inverge.africa";

function checkRequest(username: string): Request {
  return new Request(
    `${APP_ORIGIN}/api/auth/username-available?username=${encodeURIComponent(username)}`,
  );
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
  readSessionToken.mockReset();
  readSessionToken.mockResolvedValue("session-jwt");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/auth/username-available", () => {
  it("requires a session so this is not an anonymous lookup service", async () => {
    readSessionToken.mockResolvedValue(null);

    const response = await GET(checkRequest("amara"));

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unconfigured API", async () => {
    apiBase.value = null;

    const response = await GET(checkRequest("amara"));

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a handle that cannot be saved anyway", async () => {
    const response = await GET(checkRequest("a"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normalises the handle before asking the API", async () => {
    fetchMock.mockResolvedValue(upstream({ available: true }));

    const response = await GET(checkRequest("  Amara_OK "));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/check-username?username=amara_ok",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(await response.json()).toEqual({ available: true });
  });

  it("returns a taken handle as taken", async () => {
    fetchMock.mockResolvedValue(upstream({ available: false }));

    const response = await GET(checkRequest("amara"));

    expect(await response.json()).toEqual({ available: false });
  });

  it("does not invent availability when the API fails", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const response = await GET(checkRequest("amara"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "api_unreachable" });
  });

  it("rejects an unexpected upstream shape", async () => {
    fetchMock.mockResolvedValue(upstream({ available: "yes" }));

    const response = await GET(checkRequest("amara"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "invalid_response" });
  });

  it("does not pretend to check a handle in preview mode", async () => {
    previewMode.value = true;

    const response = await GET(checkRequest("amara"));

    expect(response.status).toBe(501);
    expect(await response.json()).toEqual({
      error: "not_available_in_preview",
    });
    expect(readSessionToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
