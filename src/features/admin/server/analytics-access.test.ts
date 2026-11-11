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
import { fetchApiJson, sendApiJson, isApiConfigured } from "@/lib/api/server";
import {
  decideAnalyticsAccess,
  listAnalyticsAccessRequests,
} from "./analytics-access";

const access = {
  allowed: true as const,
  preview: false,
  actor: { id: "admin-1", name: "Admin", role: "platform_admin" as const },
  reason: "Admin",
};
const request = {
  id: "analytics-1",
  userId: "user-1",
  email: "builder@example.com",
  displayName: "Amara Okonkwo",
  username: "amara",
  creatorTier: "STARTER",
  status: "PENDING",
  source: "REQUEST",
  requestedAt: "2026-11-01T09:00:00Z",
  decidedAt: null,
  expiresAt: null,
};
const page = {
  limit: 24,
  nextCursor: "next+cursor/=",
  hasMore: true,
  total: null,
  totalKind: "omitted",
};
const receipt = {
  ...request,
  status: "APPROVED",
  decidedAt: "2026-11-05T09:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue(access);
  vi.mocked(readSessionToken).mockResolvedValue("test-admin-session");
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(fetchApiJson).mockResolvedValue({ data: [request], page });
  vi.mocked(sendApiJson).mockResolvedValue({
    ok: true,
    status: 200,
    data: receipt,
  });
});

describe("analytics grant integration (FR-901)", () => {
  it("forwards the opaque cursor, filter and session to the analytics endpoint", async () => {
    expect(
      await listAnalyticsAccessRequests({
        status: "PENDING",
        limit: 24,
        cursor: "previous+/=",
      }),
    ).toMatchObject({ status: "ready", data: { data: [request], page } });
    expect(fetchApiJson).toHaveBeenCalledWith(
      "/admin/analytics/access-requests?limit=24&status=PENDING&cursor=previous%2B%2F%3D",
      { token: "test-admin-session" },
    );
  });
  it.each(["denied", "preview", "expired", "unconfigured"])(
    "prevents analytics reads and writes from a %s session",
    async (mode) => {
      if (mode === "denied")
        vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
          allowed: false,
          preview: false,
          reason: "No admin access",
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
      expect(
        await listAnalyticsAccessRequests({ status: "PENDING", limit: 24 }),
      ).toMatchObject({ status: "unavailable" });
      expect(
        await decideAnalyticsAccess("analytics-1", { status: "APPROVED" }),
      ).toMatchObject({ ok: false });
      expect(fetchApiJson).not.toHaveBeenCalled();
      expect(sendApiJson).not.toHaveBeenCalled();
    },
  );
  it.each([
    { data: [request], page: { ...page, nextCursor: null } },
    { data: [request], page: { ...page, nextCursor: "previous-cursor" } },
    { data: [request], page: { ...page, limit: 50 } },
    { data: [request], page: { ...page, total: 100 } },
    { data: [{ ...request, status: "APPROVED" }], page },
    { data: [request, request], page },
  ])("refuses an inconsistent or looping page", async (data) => {
    vi.mocked(fetchApiJson).mockResolvedValue(data);
    expect(
      await listAnalyticsAccessRequests({
        status: "PENDING",
        limit: 24,
        cursor: "previous-cursor",
      }),
    ).toMatchObject({ status: "unavailable" });
  });
  it("rejects an oversized cursor before requesting a page", async () => {
    expect(
      await listAnalyticsAccessRequests({
        status: "PENDING",
        limit: 24,
        cursor: "x".repeat(2049),
      }),
    ).toMatchObject({ status: "unavailable" });
    expect(fetchApiJson).not.toHaveBeenCalled();
  });
  it.each(["REQUEST", "PAID"])(
    "accepts the API's retained %s source on approval",
    async (source) => {
      vi.mocked(sendApiJson).mockResolvedValue({
        ok: true,
        status: 200,
        data: { ...receipt, source },
      });
      expect(
        await decideAnalyticsAccess("analytics-1", { status: "APPROVED" }),
      ).toMatchObject({ ok: true, request: { source } });
      expect(sendApiJson).toHaveBeenCalledWith(
        "/admin/analytics/access-requests/analytics-1",
        {
          method: "PATCH",
          token: "test-admin-session",
          body: { status: "APPROVED" },
        },
      );
    },
  );
  it("supports a confirmed revocation without an expiry", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 200,
      data: { ...receipt, status: "REJECTED" },
    });
    expect(
      await decideAnalyticsAccess("analytics-1", { status: "REJECTED" }),
    ).toMatchObject({
      ok: true,
      request: { status: "REJECTED", expiresAt: null },
    });
  });
  it("rejects invalid decisions before making a request", async () => {
    expect(
      await decideAnalyticsAccess("analytics-1", { status: "PENDING" }),
    ).toMatchObject({ ok: false, status: 422 });
    expect(sendApiJson).not.toHaveBeenCalled();
  });
  it.each([
    { ...receipt, id: "other" },
    { ...receipt, decidedAt: null },
    { ...receipt, expiresAt: "2099-01-01T00:00:00Z" },
    { ...receipt, creatorTier: "ADMIN" },
  ])("does not confirm a mismatched or incomplete receipt", async (data) => {
    vi.mocked(sendApiJson).mockResolvedValue({ ok: true, status: 200, data });
    expect(
      await decideAnalyticsAccess("analytics-1", { status: "APPROVED" }),
    ).toMatchObject({ ok: false, status: 502 });
  });
});
