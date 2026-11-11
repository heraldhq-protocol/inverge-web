import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(),
}));
vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: vi.fn(),
}));
vi.mock("@/lib/api/server", async (original) => ({
  ...(await original<typeof import("@/lib/api/server")>()),
  fetchApiJson: vi.fn(),
  sendApiJson: vi.fn(),
  isApiConfigured: vi.fn(),
}));
import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import { fetchApiJson, isApiConfigured, sendApiJson } from "@/lib/api/server";
import { getBoostPrices, updateBoostPrices } from "./boost-prices";

const access = {
  allowed: true as const,
  preview: false,
  actor: { id: "admin-1", name: "Admin", role: "platform_admin" as const },
  reason: "Admin",
};
const prices = {
  basic: { priceUSD: 5.37, durationDays: 7 },
  featured: { priceUSD: 20.99, durationDays: 30 },
};
const update = {
  basic: { price: { atomic: "29", currency: "USD", decimals: 2 } },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue(access);
  vi.mocked(readSessionToken).mockResolvedValue("test-admin-session");
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(fetchApiJson).mockResolvedValue(prices);
  vi.mocked(sendApiJson).mockResolvedValue({
    ok: true,
    status: 200,
    data: { ...prices, basic: { ...prices.basic, priceUSD: 0.29 } },
  });
});

describe("boost price service (FR-206, FR-904)", () => {
  it("reads exact cents through the live admin session", async () => {
    expect(await getBoostPrices()).toMatchObject({
      status: "ready",
      data: {
        basic: {
          price: { atomic: "537", currency: "USD", decimals: 2 },
          durationDays: 7,
        },
        featured: {
          price: { atomic: "2099", currency: "USD", decimals: 2 },
          durationDays: 30,
        },
      },
    });
    expect(fetchApiJson).toHaveBeenCalledExactlyOnceWith(
      "/admin/boost-prices",
      { token: "test-admin-session" },
    );
  });
  it.each(["denied", "preview", "expired", "unconfigured"])(
    "blocks reads and writes for a %s session",
    async (mode) => {
      if (mode === "denied")
        vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
          allowed: false,
          preview: false,
          reason: "No access",
        });
      if (mode === "preview")
        vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
          ...access,
          preview: true,
        });
      if (mode === "expired")
        vi.mocked(readSessionToken).mockResolvedValue(null);
      if (mode === "unconfigured")
        vi.mocked(isApiConfigured).mockReturnValue(false);
      expect(await getBoostPrices()).toMatchObject({ status: "unavailable" });
      expect(await updateBoostPrices(update)).toMatchObject({ ok: false });
      expect(fetchApiJson).not.toHaveBeenCalled();
      expect(sendApiJson).not.toHaveBeenCalled();
    },
  );
  it("does not invent prices when configuration is empty or invalid", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue({});
    expect(await getBoostPrices()).toMatchObject({ status: "unavailable" });
  });
  it("converts exact cents only at the API boundary and sends no untouched fields", async () => {
    expect(await updateBoostPrices(update)).toMatchObject({
      ok: true,
      prices: { basic: { price: { atomic: "29" } } },
    });
    expect(sendApiJson).toHaveBeenCalledExactlyOnceWith("/admin/boost-prices", {
      method: "PATCH",
      token: "test-admin-session",
      body: { basicPriceUSD: 0.29 },
    });
  });
  it("rejects invalid currency and platform parameters before writing", async () => {
    expect(
      await updateBoostPrices({
        basic: { price: { atomic: "29", currency: "USDC", decimals: 6 } },
      }),
    ).toMatchObject({ ok: false, status: 422 });
    expect(
      await updateBoostPrices({ params: { successFeeBps: 500 } }),
    ).toMatchObject({ ok: false, status: 422 });
    expect(sendApiJson).not.toHaveBeenCalled();
  });
  it("rejects a receipt that confirms only some requested changes", async () => {
    const result = await updateBoostPrices({
      ...update,
      featured: { durationDays: 90 },
    });
    expect(result).toMatchObject({
      ok: false,
      status: 502,
      code: "INVALID_RESPONSE",
      message: expect.stringContaining(
        "Some prices or durations may already have been saved",
      ),
    });
  });
  it("does not retry a possibly partial write after an upstream failure", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 503,
      code: "API_UNREACHABLE",
      message: "Nothing was changed.",
    });
    expect(await updateBoostPrices(update)).toMatchObject({
      ok: false,
      status: 503,
      message: expect.stringContaining("may already have been saved"),
    });
    expect(sendApiJson).toHaveBeenCalledTimes(1);
  });
});
