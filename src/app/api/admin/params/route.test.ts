import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getAudit } from "./audit/route";
import { GET, PATCH } from "./route";

const isSameOriginRequest = vi.fn();
const getPlatformParams = vi.fn();
const updatePlatformParams = vi.fn();
const getPlatformParamsAudit = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

vi.mock("@/features/auth/server/origin", () => ({
  isSameOriginRequest: (req: Request) => isSameOriginRequest(req),
}));

vi.mock("@/features/admin/server/params", () => ({
  getPlatformParams: () => getPlatformParams(),
  updatePlatformParams: (body: unknown) => updatePlatformParams(body),
  getPlatformParamsAudit: (query: unknown) => getPlatformParamsAudit(query),
}));

describe("BFF /api/admin/params", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns parameters when service is ready", async () => {
      getPlatformParams.mockResolvedValue({
        status: "ready",
        data: { "boost.featured.priceUSD": 150 },
      });

      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.params["boost.featured.priceUSD"]).toBe(150);
    });

    it("returns 503 when service is unavailable", async () => {
      getPlatformParams.mockResolvedValue({
        status: "unavailable",
        message: "Params service offline",
      });

      const res = await GET();
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.ok).toBe(false);
      expect(json.message).toBe("Params service offline");
    });
  });

  describe("PATCH", () => {
    it("refuses cross-site origin requests", async () => {
      isSameOriginRequest.mockReturnValue(false);

      const req = new Request("http://localhost:3000/api/admin/params", {
        method: "PATCH",
        body: JSON.stringify({ params: { "boost.featured.priceUSD": 200 } }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe("ORIGIN_NOT_ALLOWED");
      expect(updatePlatformParams).not.toHaveBeenCalled();
    });

    it("applies parameter updates and revalidates path on success", async () => {
      isSameOriginRequest.mockReturnValue(true);
      updatePlatformParams.mockResolvedValue({
        ok: true,
        params: { "boost.featured.priceUSD": 200 },
      });

      const req = new Request("http://localhost:3000/api/admin/params", {
        method: "PATCH",
        body: JSON.stringify({ params: { "boost.featured.priceUSD": 200 } }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.params["boost.featured.priceUSD"]).toBe(200);
      expect(revalidatePath).toHaveBeenCalledWith("/admin/params");
    });

    it("forwards validation or backend errors", async () => {
      isSameOriginRequest.mockReturnValue(true);
      updatePlatformParams.mockResolvedValue({
        ok: false,
        status: 422,
        code: "VALIDATION_FAILED",
        message: "Invalid parameter value",
      });

      const req = new Request("http://localhost:3000/api/admin/params", {
        method: "PATCH",
        body: JSON.stringify({ params: { "invalid.key": {} } }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.error.code).toBe("VALIDATION_FAILED");
    });
  });

  describe("GET audit", () => {
    it("passes search query parameters to the audit reader", async () => {
      getPlatformParamsAudit.mockResolvedValue({
        status: "ready",
        data: [{ id: "aud_1", key: "boost.featured.priceUSD", newValue: 200 }],
      });

      const req = new Request(
        "http://localhost:3000/api/admin/params/audit?key=boost&limit=5&offset=10",
      );

      const res = await getAudit(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.items).toHaveLength(1);
      expect(getPlatformParamsAudit).toHaveBeenCalledWith({
        key: "boost",
        limit: "5",
        offset: "10",
      });
    });
  });
});
