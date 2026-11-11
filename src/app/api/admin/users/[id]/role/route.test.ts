import { beforeEach, describe, expect, it, vi } from "vitest";

const isSameOriginRequestMock = vi.fn();
const getProgrammeAdminAccessMock = vi.fn();
const submitAdminUserRoleMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

vi.mock("@/features/auth/server/origin", () => ({
  isSameOriginRequest: () => isSameOriginRequestMock(),
}));

vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: () => getProgrammeAdminAccessMock(),
}));

vi.mock("@/features/admin/server/users", () => ({
  submitAdminUserRole: (...args: unknown[]) => submitAdminUserRoleMock(...args),
}));

import { PATCH } from "./route";

const target = {
  id: "usr_2",
  email: "zainab.bello@example.com",
  providerUserId: "did:privy:zainab",
  role: "ADMIN",
  kycStatus: "PENDING",
  bannedAt: null,
  createdAt: "2025-07-21T11:05:00.000Z",
};

function makeRequest(body: unknown, sameOrigin = true): Request {
  isSameOriginRequestMock.mockReturnValue(sameOrigin);
  return new Request("http://localhost:3000/api/admin/users/usr_2/role", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeContext(id = "usr_2") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  isSameOriginRequestMock.mockReset();
  getProgrammeAdminAccessMock.mockReset();
  submitAdminUserRoleMock.mockReset();
  revalidatePathMock.mockReset();
  isSameOriginRequestMock.mockReturnValue(true);
  getProgrammeAdminAccessMock.mockResolvedValue({
    allowed: true,
    preview: false,
    actor: { id: "usr_1", name: "Ada Admin", role: "platform_admin" },
    reason: "Admin",
  });
});

describe("PATCH /api/admin/users/[id]/role", () => {
  it("refuses cross-origin requests", async () => {
    const res = await PATCH(
      makeRequest({ role: "ADMIN" }, false),
      makeContext(),
    );
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("ORIGIN_NOT_ALLOWED");
    expect(submitAdminUserRoleMock).not.toHaveBeenCalled();
  });

  it("refuses an account without admin access", async () => {
    getProgrammeAdminAccessMock.mockResolvedValue({
      allowed: false,
      preview: false,
      reason: "Not an admin",
    });

    const res = await PATCH(makeRequest({ role: "ADMIN" }), makeContext());
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
    expect(submitAdminUserRoleMock).not.toHaveBeenCalled();
  });

  it("never writes from preview authentication", async () => {
    getProgrammeAdminAccessMock.mockResolvedValue({
      allowed: true,
      preview: true,
      actor: { id: "preview", name: "Preview", role: "platform_admin" },
      reason: "Preview",
    });

    const res = await PATCH(makeRequest({ role: "ADMIN" }), makeContext());
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe("API_REQUIRED");
    expect(submitAdminUserRoleMock).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON", async () => {
    isSameOriginRequestMock.mockReturnValue(true);
    const request = new Request(
      "http://localhost:3000/api/admin/users/usr_2/role",
      {
        method: "PATCH",
        body: "{",
        headers: { "content-type": "application/json" },
      },
    );

    const res = await PATCH(request, makeContext());
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_BODY");
  });

  it("rejects a role this deployment cannot assign", async () => {
    const res = await PATCH(
      makeRequest({ role: "COMPLIANCE_REVIEWER" }),
      makeContext(),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe("VALIDATION_FAILED");
    expect(submitAdminUserRoleMock).not.toHaveBeenCalled();
  });

  it("blocks self-demotion before the API is called", async () => {
    const res = await PATCH(
      makeRequest({ role: "USER" }),
      makeContext("usr_1"),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("SELF_DEMOTION");
    expect(submitAdminUserRoleMock).not.toHaveBeenCalled();
  });

  it("records the change and revalidates the directory", async () => {
    submitAdminUserRoleMock.mockResolvedValue({ ok: true, user: target });

    const res = await PATCH(makeRequest({ role: "ADMIN" }), makeContext());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(target);
    expect(submitAdminUserRoleMock).toHaveBeenCalledWith("usr_2", "ADMIN");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
  });

  it("forwards an API refusal with its status", async () => {
    submitAdminUserRoleMock.mockResolvedValue({
      ok: false,
      status: 409,
      code: "CONFLICT",
      message: "The account changed since it was listed.",
    });

    const res = await PATCH(makeRequest({ role: "ADMIN" }), makeContext());
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatchObject({
      code: "CONFLICT",
      message: "The account changed since it was listed.",
    });
  });
});
