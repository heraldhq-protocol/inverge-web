import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/admin/server/ai-access", () => ({
  decideAiAccess: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { decideAiAccess } from "@/features/admin/server/ai-access";
import { PATCH } from "./route";

const context = () => ({ params: Promise.resolve({ id: "grant-1" }) });
function request(
  body = '{"status":"APPROVED"}',
  origin = "http://localhost:3000",
) {
  return new Request(
    "http://localhost:3000/api/admin/ai/access-requests/grant-1",
    {
      method: "PATCH",
      headers: { origin, "content-type": "application/json" },
      body,
    },
  );
}
beforeEach(() => vi.resetAllMocks());

describe("AI decision BFF", () => {
  it("refuses cross-origin writes before reaching the admin service (FR-901)", async () => {
    expect(
      (await PATCH(request(undefined, "https://other.example"), context()))
        .status,
    ).toBe(403);
    expect(decideAiAccess).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON", async () => {
    expect((await PATCH(request("{"), context())).status).toBe(400);
    expect(decideAiAccess).not.toHaveBeenCalled();
  });
  it("preserves an authorization refusal and never revalidates it", async () => {
    vi.mocked(decideAiAccess).mockResolvedValue({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: "Administrator access required.",
    });
    const response = await PATCH(request(), context());
    expect(response.status).toBe(403);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("returns a confirmed, non-cacheable receipt and revalidates the queue", async () => {
    const grant = {
      id: "grant-1",
      userId: "user-1",
      email: null,
      status: "APPROVED" as const,
      source: "ADMIN" as const,
      requestedAt: "2026-11-01T09:00:00Z",
      decidedAt: "2026-11-05T09:00:00Z",
      expiresAt: null,
    };
    vi.mocked(decideAiAccess).mockResolvedValue({ ok: true, request: grant });
    const response = await PATCH(request(), context());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ mode: "live", request: grant });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/ai-access");
  });
});
