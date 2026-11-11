import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/admin/server/boost-prices", () => ({
  updateBoostPrices: vi.fn(),
}));
import { revalidatePath } from "next/cache";
import { updateBoostPrices } from "@/features/admin/server/boost-prices";
import { PATCH } from "./route";

function request(
  origin = "http://localhost:3001",
  body = '{"basic":{"durationDays":10}}',
) {
  return new Request("http://localhost:3001/api/admin/boost-prices", {
    method: "PATCH",
    headers: { origin, "content-type": "application/json" },
    body,
  });
}
beforeEach(() => vi.resetAllMocks());
describe("boost pricing BFF (FR-904)", () => {
  it("rejects missing/foreign origins and malformed JSON", async () => {
    expect((await PATCH(request(""))).status).toBe(403);
    expect((await PATCH(request("https://other.example"))).status).toBe(403);
    expect((await PATCH(request(undefined, "{"))).status).toBe(400);
    expect(updateBoostPrices).not.toHaveBeenCalled();
  });
  it("preserves a failed confirmation without claiming a refresh succeeded", async () => {
    vi.mocked(updateBoostPrices).mockResolvedValue({
      ok: false,
      status: 502,
      code: "INVALID_RESPONSE",
      message: "Reload prices before trying again.",
    });
    expect((await PATCH(request())).status).toBe(502);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("returns a non-cacheable exact-money receipt and invalidates the pricing view", async () => {
    const prices = {
      basic: {
        price: {
          atomic: "537",
          currency: "USD" as const,
          decimals: 2 as const,
        },
        durationDays: 10,
      },
      featured: {
        price: {
          atomic: "2099",
          currency: "USD" as const,
          decimals: 2 as const,
        },
        durationDays: 30,
      },
    };
    vi.mocked(updateBoostPrices).mockResolvedValue({ ok: true, prices });
    const response = await PATCH(request());
    expect(await response.json()).toEqual({ mode: "live", prices });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(updateBoostPrices).toHaveBeenCalledExactlyOnceWith({
      basic: { durationDays: 10 },
    });
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith(
      "/admin/boost-prices",
    );
  });
});
