import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clearSessionCookie = vi.hoisted(() => vi.fn(async () => undefined));
const clearOnboardingIntent = vi.hoisted(() => vi.fn(async () => undefined));
const clearEmailHint = vi.hoisted(() => vi.fn(async () => undefined));
const clearPreviewSession = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("@/features/auth/server/preview-session", () => ({
  clearPreviewSession,
}));
vi.mock("@/features/auth/server/session", () => ({
  clearEmailHint,
  clearOnboardingIntent,
  clearSessionCookie,
}));

import { POST } from "@/app/api/auth/sign-out/route";

const APP_ORIGIN = "https://inverge.africa";

function signOutRequest(origin: string | null = APP_ORIGIN): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);

  return new Request(`${APP_ORIGIN}/api/auth/sign-out`, {
    headers,
    method: "POST",
  });
}

beforeEach(() => {
  clearSessionCookie.mockClear();
  clearEmailHint.mockClear();
  clearOnboardingIntent.mockClear();
  clearPreviewSession.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/auth/sign-out", () => {
  it("clears the session cookie for this app", async () => {
    const response = await POST(signOutRequest());

    expect(response.status).toBe(204);
    expect(clearSessionCookie).toHaveBeenCalledTimes(1);
    expect(clearPreviewSession).toHaveBeenCalledTimes(1);
    expect(clearEmailHint).toHaveBeenCalledTimes(1);
    expect(clearOnboardingIntent).toHaveBeenCalledTimes(1);
  });

  it("refuses a cross-site sign-out", async () => {
    const response = await POST(signOutRequest("https://evil.test"));

    expect(response.status).toBe(403);
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });
});
