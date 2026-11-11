import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: vi.fn(),
}));
vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(),
}));
vi.mock("@/lib/api/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/server")>()),
  fetchApiJson: vi.fn(),
  sendApiJson: vi.fn(),
  isApiConfigured: vi.fn(),
}));

import { previewAdminUsers } from "@/features/admin/content/preview-users";
import {
  listAdminUsers,
  submitAdminUserRole,
} from "@/features/admin/server/users";
import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
  sendApiJson,
} from "@/lib/api/server";

const actor = {
  id: "test-admin",
  name: "Test admin",
  role: "platform_admin" as const,
};

const user = {
  id: "usr_1",
  email: "amara.okonkwo@example.com",
  providerUserId: "did:privy:abc",
  role: "ADMIN" as const,
  kycStatus: "VERIFIED" as const,
  bannedAt: null,
  createdAt: "2026-01-06T10:10:00.000Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
    allowed: true,
    actor,
    preview: false,
    reason: "Admin",
  });
  vi.mocked(readSessionToken).mockResolvedValue("test-session");
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(fetchApiJson).mockResolvedValue([user]);
  vi.mocked(sendApiJson).mockResolvedValue({
    ok: true,
    data: user,
    status: 200,
  });
});

describe("listAdminUsers (FR-901)", () => {
  it("does not read the directory for a denied account", async () => {
    vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
      allowed: false,
      preview: false,
      reason: "Denied",
    });

    expect(await listAdminUsers()).toEqual({ status: "denied" });
    expect(readSessionToken).not.toHaveBeenCalled();
    expect(fetchApiJson).not.toHaveBeenCalled();
  });

  it("filters and paginates preview rows without touching the API", async () => {
    vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
      allowed: true,
      actor,
      preview: true,
      reason: "Preview",
    });

    const admins = await listAdminUsers({ role: "ADMIN" });
    expect(admins.status).toBe("preview");
    if (admins.status !== "preview") return;
    expect(admins.users.map((row) => row.role)).toEqual(["ADMIN", "ADMIN"]);

    const page = await listAdminUsers({ offset: 1, limit: 2 });
    expect(page.status).toBe("preview");
    if (page.status !== "preview") return;
    expect(page.users).toHaveLength(2);
    expect(page.users[0]?.id).toBe(previewAdminUsers[1]?.id);
    expect(page.hasMore).toBe(true);

    const search = await listAdminUsers({ query: "AMARA" });
    expect(search.status).toBe("preview");
    if (search.status !== "preview") return;
    expect(search.users.map((row) => row.id)).toEqual(["usr_preview_amara"]);

    expect(readSessionToken).not.toHaveBeenCalled();
    expect(fetchApiJson).not.toHaveBeenCalled();
  });

  it("forwards search, role, limit and offset to the API", async () => {
    const result = await listAdminUsers({
      query: "amara",
      role: "ADMIN",
      limit: 10,
      offset: 20,
    });

    expect(result.status).toBe("live");
    expect(fetchApiJson).toHaveBeenCalledWith(
      "/admin/users?limit=10&offset=20&query=amara&role=ADMIN",
      { token: "test-session" },
    );
    if (result.status !== "live") return;
    expect(result.users).toEqual([user]);
    expect(result.hasMore).toBe(false);
  });

  it("reports an incomplete payload instead of rendering it", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue([{ id: "usr_1" }]);

    const result = await listAdminUsers();
    expect(result.status).toBe("unavailable");
    if (result.status !== "unavailable") return;
    expect(result.reason).toMatch(/invalid user list/i);
  });

  it("names an expired session rather than a generic failure", async () => {
    vi.mocked(fetchApiJson).mockRejectedValue(
      new ApiRequestError("Unauthorized", 401, "UNAUTHORIZED"),
    );

    const result = await listAdminUsers();
    expect(result.status).toBe("unavailable");
    if (result.status !== "unavailable") return;
    expect(result.reason).toMatch(/sign in again/i);
  });

  it("does not fetch when the session has no token", async () => {
    vi.mocked(readSessionToken).mockResolvedValue(null);

    const result = await listAdminUsers();
    expect(result.status).toBe("unavailable");
    expect(fetchApiJson).not.toHaveBeenCalled();
  });
});

describe("submitAdminUserRole (FR-901)", () => {
  it("refuses to write without a session token", async () => {
    vi.mocked(readSessionToken).mockResolvedValue(null);

    const result = await submitAdminUserRole("usr_1", "ADMIN");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("NOT_SIGNED_IN");
    expect(sendApiJson).not.toHaveBeenCalled();
  });

  it("sends the role with the session token", async () => {
    const result = await submitAdminUserRole("usr_1", "ADMIN");

    expect(sendApiJson).toHaveBeenCalledWith("/admin/users/usr_1/role", {
      method: "PATCH",
      token: "test-session",
      body: { role: "ADMIN" },
    });
    expect(result).toEqual({ ok: true, user });
  });

  it("forwards an API refusal with its status and code", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: "Only administrators can change roles.",
    });

    const result = await submitAdminUserRole("usr_1", "ADMIN");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);
    expect(result.code).toBe("FORBIDDEN");
  });

  it("refuses a response that describes a different account", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      data: { ...user, id: "usr_other" },
      status: 200,
    });

    const result = await submitAdminUserRole("usr_1", "ADMIN");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_RESPONSE");
  });
});
