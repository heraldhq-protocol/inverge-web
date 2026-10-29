import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const readSessionToken = vi.hoisted(() =>
  vi.fn(async (): Promise<string | null> => "session-jwt"),
);
const clearEmailHint = vi.hoisted(() => vi.fn(async () => undefined));
const apiBase = vi.hoisted(() => ({
  value: "https://api.inverge.test" as string | null,
}));

vi.mock("@/features/auth/server/session", () => ({
  clearEmailHint,
  readSessionToken,
}));
vi.mock("@/features/auth/server/session-user", () => ({
  apiBaseUrl: () => apiBase.value,
}));

import { GET, POST } from "@/app/api/auth/email/route";

const APP_ORIGIN = "https://inverge.africa";

function post(body: unknown, origin: string | null = APP_ORIGIN): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (origin) headers.set("origin", origin);
  return new Request(`${APP_ORIGIN}/api/auth/email`, {
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
  readSessionToken.mockResolvedValue("session-jwt");
  clearEmailHint.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/auth/email", () => {
  it("returns the status projection without the session token", async () => {
    fetchMock.mockResolvedValue(
      upstream({
        challenge: null,
        email: "ada@example.com",
        pendingEmail: null,
        pendingRequestedAt: null,
        verified: true,
        verifiedAt: "2026-10-29T12:00:00.000Z",
      }),
    );

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/email",
      expect.objectContaining({
        headers: { Authorization: "Bearer session-jwt" },
      }),
    );
    expect(JSON.parse(text)).toMatchObject({
      email: "ada@example.com",
      verified: true,
    });
    expect(text).not.toContain("session-jwt");
  });

  it("requires a session before asking the API", async () => {
    readSessionToken.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unreachable API without inventing a state", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const response = await GET();

    expect(response.status).toBe(502);
  });
});

describe("POST /api/auth/email", () => {
  it("refuses a cross-site request", async () => {
    const response = await POST(post({ action: "resend" }, "https://evil.test"));

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards a normalised request and returns only timing fields", async () => {
    fetchMock.mockResolvedValue(
      upstream({
        email: "ada@example.com",
        expiresAt: "2026-10-29T12:10:00.000Z",
        resendAvailableAt: "2026-10-29T12:01:00.000Z",
        status: "code_sent",
      }),
    );

    const response = await POST(
      post({ action: "request", email: "  Ada@Example.com " }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/email/request",
      expect.objectContaining({
        body: JSON.stringify({ email: "Ada@Example.com" }),
        method: "POST",
      }),
    );
    expect(await response.json()).toEqual({
      email: "ada@example.com",
      expiresAt: "2026-10-29T12:10:00.000Z",
      resendAvailableAt: "2026-10-29T12:01:00.000Z",
      status: "code_sent",
    });
  });

  it("clears the hint and reports onboarding after a successful verify", async () => {
    fetchMock
      .mockResolvedValueOnce(
        upstream({
          email: "ada@example.com",
          status: "verified",
          verifiedAt: "2026-10-29T12:00:00.000Z",
        }),
      )
      .mockResolvedValueOnce(upstream({ requiresOnboarding: false }));

    const response = await POST(
      post({ action: "verify", code: "123456", email: "ada@example.com" }),
    );

    expect(clearEmailHint).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.inverge.test/auth/email/verify",
      expect.objectContaining({
        body: JSON.stringify({
          code: "123456",
          email: "ada@example.com",
        }),
      }),
    );
    expect(await response.json()).toEqual({
      email: "ada@example.com",
      requiresOnboarding: false,
      status: "verified",
    });
  });

  it("preserves a cooldown code and its retry hint", async () => {
    fetchMock.mockResolvedValue(
      upstream(
        {
          error: {
            code: "EMAIL_RESEND_COOLDOWN",
            details: { retryAfterSeconds: 42 },
          },
        },
        429,
      ),
    );

    const response = await POST(post({ action: "resend" }));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: "EMAIL_RESEND_COOLDOWN",
      retryAfterSeconds: 42,
    });
  });

  it("does not reflect an unknown upstream message", async () => {
    fetchMock.mockResolvedValue(
      upstream({ error: { code: "SOMETHING_INTERNAL" }, message: "secret" }, 500),
    );

    const response = await POST(post({ action: "request", email: "a@b.co" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "request_failed" });
  });

  it("rejects a malformed code before calling the API", async () => {
    const response = await POST(
      post({ action: "verify", code: "12ab", email: "ada@example.com" }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("cancels a pending change with the API's DELETE route", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const response = await POST(post({ action: "cancel" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.inverge.test/auth/email/pending",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(await response.json()).toEqual({ pendingEmail: null });
  });
});
