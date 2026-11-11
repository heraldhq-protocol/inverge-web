import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/admin/server/analytics-access", () => ({
  decideAnalyticsAccess: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { decideAnalyticsAccess } from "@/features/admin/server/analytics-access";
import { PATCH } from "./route";

function request(
  origin = "http://localhost:3000",
  body = '{"status":"REJECTED"}',
) {
  return new Request(
    "http://localhost:3000/api/admin/analytics/access-requests/grant-1",
    {
      method: "PATCH",
      headers: { origin, "content-type": "application/json" },
      body,
    },
  );
}
const context = () => ({ params: Promise.resolve({ id: "grant-1" }) });
beforeEach(() => vi.resetAllMocks());

describe("analytics decision BFF (FR-901)", () => {
  it("blocks cross-site requests and invalid JSON before the service", async () => {
    expect(
      (await PATCH(request("https://other.example"), context())).status,
    ).toBe(403);
    expect((await PATCH(request(undefined, "{"), context())).status).toBe(400);
    expect(decideAnalyticsAccess).not.toHaveBeenCalled();
  });
  it("preserves a session refusal without invalidating the page", async () => {
    vi.mocked(decideAnalyticsAccess).mockResolvedValue({
      ok: false,
      status: 401,
      code: "NOT_SIGNED_IN",
      message: "Sign in again.",
    });
    expect((await PATCH(request(), context())).status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("returns the confirmed analytics record without modifying the AI queue", async () => {
    const record = {
      id: "grant-1",
      userId: "user-1",
      email: null,
      displayName: null,
      username: null,
      creatorTier: "STARTER" as const,
      status: "REJECTED" as const,
      source: "REQUEST" as const,
      requestedAt: "2026-11-01T09:00:00Z",
      decidedAt: "2026-11-05T09:00:00Z",
      expiresAt: null,
    };
    vi.mocked(decideAnalyticsAccess).mockResolvedValue({
      ok: true,
      request: record,
    });
    const response = await PATCH(request(), context());
    expect(await response.json()).toEqual({ mode: "live", request: record });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith(
      "/admin/analytics-access",
    );
  });
});
