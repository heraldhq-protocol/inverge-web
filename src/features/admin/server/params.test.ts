import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  previewParamAuditEntries,
  previewPlatformParams,
} from "@/features/admin/lib/params";
import {
  getPlatformParams,
  getPlatformParamsAudit,
  updatePlatformParams,
} from "./params";

const requireAdminApiSession = vi.fn();
const fetchApiJson = vi.fn();
const sendApiJson = vi.fn();

vi.mock("@/features/admin/server/admin-api", () => ({
  adminReadUnavailable: vi.fn((err) => ({
    status: "unavailable",
    message: err instanceof Error ? err.message : String(err),
  })),
  adminWriteFailure: vi.fn((res) => ({
    ok: false,
    status: res.status,
    code: res.code,
    message: res.message,
  })),
  requireAdminApiSession: () => requireAdminApiSession(),
}));

vi.mock("@/lib/api/server", () => ({
  fetchApiJson: (...args: unknown[]) => fetchApiJson(...args),
  sendApiJson: (...args: unknown[]) => sendApiJson(...args),
}));

describe("admin platform params server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlatformParams", () => {
    it("returns ready data from the live service", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      fetchApiJson.mockResolvedValue({
        "boost.featured.priceUSD": 150,
        "platform.maintenance": false,
      });

      const res = await getPlatformParams();
      expect(res.status).toBe("ready");
      if (res.status === "ready") {
        expect(res.data["boost.featured.priceUSD"]).toBe(150);
        expect(res.data["platform.maintenance"]).toBe(false);
      }
      expect(fetchApiJson).toHaveBeenCalledWith("/admin/params", {
        token: "admin-jwt-token",
      });
    });

    it("returns preview fixtures for preview admin sessions", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "preview",
      });

      const res = await getPlatformParams();
      expect(res.status).toBe("ready");
      if (res.status === "ready") {
        expect(res.data).toEqual(previewPlatformParams);
      }
      expect(fetchApiJson).not.toHaveBeenCalled();
    });

    it("returns unavailable when admin session fails", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: false,
        status: 401,
        code: "UNAUTHENTICATED",
        message: "Sign in required",
      });

      const res = await getPlatformParams();
      expect(res.status).toBe("unavailable");
    });
  });

  describe("updatePlatformParams", () => {
    it("blocks preview sessions from mutating live params", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "preview",
      });

      const res = await updatePlatformParams({
        params: { "boost.featured.priceUSD": 200 },
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("PREVIEW_MODE");
      }
      expect(sendApiJson).not.toHaveBeenCalled();
    });

    it("rejects invalid payload without contacting service", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });

      const res = await updatePlatformParams({
        params: {},
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(422);
      }
      expect(sendApiJson).not.toHaveBeenCalled();
    });

    it("sends valid PATCH request and returns updated params on success", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      sendApiJson.mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          "boost.featured.priceUSD": 200,
        },
      });

      const res = await updatePlatformParams({
        params: { "boost.featured.priceUSD": 200 },
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.params["boost.featured.priceUSD"]).toBe(200);
      }
      expect(sendApiJson).toHaveBeenCalledWith("/admin/params", {
        method: "PATCH",
        token: "admin-jwt-token",
        body: {
          params: { "boost.featured.priceUSD": 200 },
        },
      });
    });

    it("handles 500 error as unconfirmed without pretending nothing changed", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      sendApiJson.mockResolvedValue({
        ok: false,
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      });

      const res = await updatePlatformParams({
        params: { "boost.featured.priceUSD": 200 },
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.message).toContain("did not confirm");
      }
    });
  });

  describe("getPlatformParamsAudit", () => {
    it("returns audit entries for live admin session with query params", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      fetchApiJson.mockResolvedValue([
        {
          id: "aud_1",
          key: "boost.featured.priceUSD",
          oldValue: 150,
          newValue: 200,
        },
      ]);

      const res = await getPlatformParamsAudit({
        key: "boost.featured.priceUSD",
        limit: 10,
        offset: 0,
      });
      expect(res.status).toBe("ready");
      if (res.status === "ready") {
        expect(res.data).toHaveLength(1);
        expect(res.data[0]?.id).toBe("aud_1");
      }
      expect(fetchApiJson).toHaveBeenCalledWith(
        "/admin/params/audit?key=boost.featured.priceUSD&limit=10&offset=0",
        { token: "admin-jwt-token" },
      );
    });

    it("returns preview fixtures in preview mode", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "preview",
      });

      const res = await getPlatformParamsAudit();
      expect(res.status).toBe("ready");
      if (res.status === "ready") {
        expect(res.data).toEqual(previewParamAuditEntries);
      }
      expect(fetchApiJson).not.toHaveBeenCalled();
    });
  });
});
