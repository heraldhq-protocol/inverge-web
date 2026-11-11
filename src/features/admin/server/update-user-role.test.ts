import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(),
}));
vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: vi.fn(),
}));
vi.mock("@/lib/api/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/server")>()),
  sendApiJson: vi.fn(),
}));

import { readSessionToken } from "@/features/auth/server/session";
import { sendApiJson } from "@/lib/api/server";
import type { AssignableAdminUserRole } from "@/features/admin/lib/users";
import { submitAdminUserRole } from "./users";

const user = {
  id: "user-test",
  email: "member@example.test",
  providerUserId: "provider-test",
  role: "ADMIN",
  kycStatus: "NOT_REQUIRED",
  bannedAt: null,
  createdAt: "2026-11-01T00:00:00.000Z",
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(readSessionToken).mockResolvedValue("test-session");
});

describe("FR-901 role-update contract", () => {
  it("validates the role even when called outside the BFF", async () => {
    expect(
      await submitAdminUserRole(
        "user-test",
        "COMPLIANCE_REVIEWER" as AssignableAdminUserRole,
      ),
    ).toMatchObject({ ok: false, status: 422 });
    expect(sendApiJson).not.toHaveBeenCalled();
  });
  it("sends the supported role and validates the confirmed result", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 200,
      data: user,
    });
    expect(await submitAdminUserRole("user-test", "ADMIN")).toEqual({
      ok: true,
      user,
    });
    expect(sendApiJson).toHaveBeenCalledWith("/admin/users/user-test/role", {
      method: "PATCH",
      token: "test-session",
      body: { role: "ADMIN" },
    });
  });
  it("does not report a different confirmed role as success", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 200,
      data: { ...user, role: "USER" },
    });
    expect(await submitAdminUserRole("user-test", "ADMIN")).toMatchObject({
      ok: false,
      status: 502,
    });
  });
});
