import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/admin/server/moderation", () => ({
  screenContent: vi.fn(),
}));
import { screenContent } from "@/features/admin/server/moderation";
import { POST } from "./route";

function request(
  origin = "http://localhost:3001",
  body = '{"kind":"idea","text":"Workshop"}',
) {
  return new Request("http://localhost:3001/api/admin/moderation/screen", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body,
  });
}
beforeEach(() => vi.resetAllMocks());
describe("screening BFF (FR-901)", () => {
  it("rejects missing/foreign origins and invalid JSON before screening", async () => {
    expect((await POST(request(""))).status).toBe(403);
    expect((await POST(request("https://other.example"))).status).toBe(403);
    expect((await POST(request(undefined, "{"))).status).toBe(400);
    expect(screenContent).not.toHaveBeenCalled();
  });
  it("preserves safe service failures", async () => {
    vi.mocked(screenContent).mockResolvedValue({
      ok: false,
      status: 401,
      code: "NOT_SIGNED_IN",
      message: "Sign in again.",
    });
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: { code: "NOT_SIGNED_IN" },
    });
  });
  it("returns only a confirmed, non-cacheable result", async () => {
    const screening = {
      id: "case-1",
      kind: "idea" as const,
      ideaId: null,
      campaignId: null,
      submittedById: "admin-1",
      decision: "AUTO_CLEAR" as const,
      maxRisk: 0,
      categories: [],
      reasonCodes: [],
      internalReason: "No findings.",
      externalReason: "",
      brief: "No flags.",
      provider: "stub",
      policyVersion: "2026-07-25",
      createdAt: "2026-11-05T12:00:00Z",
    };
    vi.mocked(screenContent).mockResolvedValue({ ok: true, screening });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ mode: "live", screening });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(screenContent).toHaveBeenCalledExactlyOnceWith({
      kind: "idea",
      text: "Workshop",
    });
  });
});
