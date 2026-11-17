import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/admin/server/aml", () => ({
  screenAml: vi.fn(),
}));
import { screenAml } from "@/features/admin/server/aml";
import { POST } from "./route";

function request(
  origin = "http://localhost:3001",
  body = '{"kind":"individual","userId":"user-1","fullName":"Test Person"}',
) {
  return new Request("http://localhost:3001/api/admin/aml/screen", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body,
  });
}
beforeEach(() => vi.resetAllMocks());

describe("AML screening BFF (FR-103, FR-104, NFR-19)", () => {
  it("rejects missing/foreign origins and invalid JSON before screening", async () => {
    expect((await POST(request(""))).status).toBe(403);
    expect((await POST(request("https://other.example"))).status).toBe(403);
    expect((await POST(request(undefined, "{"))).status).toBe(400);
    expect(screenAml).not.toHaveBeenCalled();
  });

  it("preserves safe service failures", async () => {
    vi.mocked(screenAml).mockResolvedValue({
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message: "Enter the subject's full name.",
    });
    const response = await POST(request());
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      error: { code: "VALIDATION_FAILED" },
    });
  });

  it("returns only a confirmed, non-cacheable result", async () => {
    const result = {
      datasets: ["sanctions"],
      topRiskScore: null,
      totalHits: 0,
      status: "CLEAR" as const,
    };
    vi.mocked(screenAml).mockResolvedValue({
      ok: true,
      kind: "individual",
      userId: "user-1",
      result,
    });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      mode: "live",
      kind: "individual",
      userId: "user-1",
      result,
    });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(screenAml).toHaveBeenCalledExactlyOnceWith({
      kind: "individual",
      userId: "user-1",
      fullName: "Test Person",
    });
  });
});
