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
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
  sendApiJson,
} from "@/lib/api/server";
import { decideAiAccess, listAiAccessRequests } from "./ai-access";

const access = {
  allowed: true as const,
  preview: false,
  actor: { id: "admin-1", name: "Admin", role: "platform_admin" as const },
  reason: "Admin",
};
const request = {
  id: "grant-1",
  userId: "user-1",
  email: "builder@example.com",
  status: "PENDING",
  source: "REQUEST",
  requestedAt: "2026-11-01T09:00:00Z",
  decidedAt: null,
  expiresAt: null,
};
const receipt = {
  ...request,
  status: "APPROVED",
  source: "ADMIN",
  decidedAt: "2026-11-05T09:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue(access);
  vi.mocked(readSessionToken).mockResolvedValue("test-admin-session");
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(fetchApiJson).mockResolvedValue({ data: [request] });
  vi.mocked(sendApiJson).mockResolvedValue({
    ok: true,
    status: 200,
    data: receipt,
  });
});

describe("AI access integration (FR-901, D-055)", () => {
  it("forwards a live admin token and the supported list query", async () => {
    expect(
      await listAiAccessRequests({ status: "PENDING", limit: 50 }),
    ).toEqual({ status: "ready", data: [request] });
    expect(fetchApiJson).toHaveBeenCalledWith(
      "/admin/ai/access-requests?limit=50&status=PENDING",
      { token: "test-admin-session" },
    );
  });
  it("omits the status for all requests instead of sending an unsupported enum", async () => {
    await listAiAccessRequests({ status: "ALL", limit: 200 });
    expect(fetchApiJson).toHaveBeenCalledWith(
      "/admin/ai/access-requests?limit=200",
      { token: "test-admin-session" },
    );
  });
  it.each(["denied", "preview", "expired", "unconfigured"])(
    "blocks both reads and writes for %s access",
    async (mode) => {
      if (mode === "denied")
        vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
          allowed: false,
          preview: false,
          reason: "Forbidden",
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
        await listAiAccessRequests({ status: "PENDING", limit: 50 }),
      ).toMatchObject({ status: "unavailable" });
      expect(
        await decideAiAccess("grant-1", { status: "APPROVED" }),
      ).toMatchObject({ ok: false });
      expect(fetchApiJson).not.toHaveBeenCalled();
      expect(sendApiJson).not.toHaveBeenCalled();
    },
  );
  it.each([
    { data: [{ ...request, status: "APPROVED" }] },
    { data: [{ ...request, requestedAt: "bad-date" }] },
    { data: [request, request] },
    [request],
  ])("refuses a malformed or misleading queue", async (payload) => {
    vi.mocked(fetchApiJson).mockResolvedValue(payload);
    expect(
      await listAiAccessRequests({ status: "PENDING", limit: 50 }),
    ).toMatchObject({ status: "unavailable" });
  });
  it("shows a service error without fixtures or upstream private detail", async () => {
    vi.mocked(fetchApiJson).mockRejectedValue(
      new ApiRequestError("private diagnostic", 500, "ERROR"),
    );
    const result = await listAiAccessRequests({ status: "PENDING", limit: 50 });
    expect(result).toMatchObject({ status: "unavailable" });
    expect(JSON.stringify(result)).not.toContain("private diagnostic");
  });
  it("sends a decision and only returns the confirmed grant", async () => {
    expect(await decideAiAccess("grant-1", { status: "APPROVED" })).toEqual({
      ok: true,
      request: receipt,
    });
    expect(sendApiJson).toHaveBeenCalledWith(
      "/admin/ai/access-requests/grant-1",
      {
        method: "PATCH",
        token: "test-admin-session",
        body: { status: "APPROVED" },
      },
    );
  });
  it("rejects invalid input before calling the API", async () => {
    expect(
      await decideAiAccess("grant-1", {
        status: "APPROVED",
        expiresAt: "2020-01-01T00:00:00Z",
      }),
    ).toMatchObject({ ok: false, status: 422 });
    expect(sendApiJson).not.toHaveBeenCalled();
  });
  it.each([
    { ...receipt, id: "other-grant" },
    { ...receipt, status: "REJECTED" },
    { ...receipt, source: "REQUEST" },
    { ...receipt, decidedAt: null },
    { ...receipt, expiresAt: "2099-01-01T00:00:00Z" },
  ])("refuses an inconsistent success receipt", async (data) => {
    vi.mocked(sendApiJson).mockResolvedValue({ ok: true, status: 200, data });
    expect(
      await decideAiAccess("grant-1", { status: "APPROVED" }),
    ).toMatchObject({ ok: false, status: 502, code: "INVALID_RESPONSE" });
  });
  it("preserves a stale-decision conflict and makes a timeout inconclusive", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 409,
      code: "CONFLICT",
      message: "Already decided",
    });
    expect(
      await decideAiAccess("grant-1", { status: "APPROVED" }),
    ).toMatchObject({ ok: false, status: 409 });
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 503,
      code: "API_UNREACHABLE",
      message: "Nothing was changed.",
    });
    const result = await decideAiAccess("grant-1", { status: "APPROVED" });
    expect(result).toMatchObject({ ok: false, status: 503 });
    expect(JSON.stringify(result)).not.toContain("Nothing was changed");
  });
});
