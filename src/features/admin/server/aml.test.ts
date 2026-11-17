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
import { listAmlScreenings, screenAml } from "./aml";

const access = {
  allowed: true as const,
  preview: false,
  actor: { id: "admin-1", name: "Admin", role: "platform_admin" as const },
  reason: "Admin",
};
const input = {
  kind: "individual" as const,
  userId: "user-1",
  fullName: "Test Person",
};
const result = {
  datasets: ["sanctions"],
  topRiskScore: null,
  totalHits: 0,
  status: "CLEAR",
};
const record = {
  id: "screen-1",
  source: "STANDALONE",
  status: "CLEAR",
  topRiskScore: null,
  totalHits: 0,
  datasets: ["sanctions"],
  createdAt: "2026-11-16T09:30:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue(access);
  vi.mocked(readSessionToken).mockResolvedValue("test-admin-session");
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(sendApiJson).mockResolvedValue({
    ok: true,
    status: 201,
    data: result,
  });
});

describe("admin AML screening write (FR-103, FR-104, NFR-19)", () => {
  it("sends only the validated fields to the individual endpoint", async () => {
    expect(
      await screenAml({ ...input, dateOfBirth: "1990-01-31" }),
    ).toMatchObject({
      ok: true,
      kind: "individual",
      userId: "user-1",
      result,
    });
    expect(sendApiJson).toHaveBeenCalledExactlyOnceWith(
      "/kyc/admin/aml-screen",
      {
        method: "POST",
        token: "test-admin-session",
        body: {
          userId: "user-1",
          fullName: "Test Person",
          dateOfBirth: "1990-01-31",
        },
        timeoutMs: 30_000,
      },
    );
  });

  it("routes business screening to the business endpoint", async () => {
    await screenAml({ ...input, kind: "business" });
    expect(sendApiJson).toHaveBeenCalledExactlyOnceWith(
      "/kyb/admin/aml-screen",
      {
        method: "POST",
        token: "test-admin-session",
        body: { userId: "user-1", fullName: "Test Person" },
        timeoutMs: 30_000,
      },
    );
  });

  it.each(["denied", "preview", "expired", "unconfigured"])(
    "blocks a %s session before screening",
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
      await expect(screenAml(input)).resolves.toMatchObject({
        ok: false,
        code: expect.any(String),
      });
      expect(sendApiJson).not.toHaveBeenCalled();
    },
  );

  it("rejects invalid input without contacting the service", async () => {
    await expect(screenAml({ ...input, fullName: "" })).resolves.toMatchObject({
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
    });
    expect(sendApiJson).not.toHaveBeenCalled();
  });

  it("explains a business screening without a registered business", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 404,
      code: "NOT_FOUND",
      message: "No business profile.",
    });
    await expect(
      screenAml({ ...input, kind: "business" }),
    ).resolves.toMatchObject({
      ok: false,
      status: 404,
      message: /no registered business/,
    });
  });

  it.each([
    { status: 0, code: "NETWORK_ERROR" },
    { status: 503, code: "SERVICE_UNAVAILABLE" },
  ])(
    "does not promise an unconfirmed attempt saved nothing ($status)",
    async ({ status, code }) => {
      vi.mocked(sendApiJson).mockResolvedValue({
        ok: false,
        status,
        code,
        message: "Failed.",
      });
      await expect(screenAml(input)).resolves.toMatchObject({
        ok: false,
        message: /may already have been saved/,
      });
    },
  );

  it("rejects a malformed confirmation before rendering", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 201,
      data: { ...result, status: "APPROVED" },
    });
    await expect(screenAml(input)).resolves.toMatchObject({
      ok: false,
      status: 502,
      code: "INVALID_RESPONSE",
    });
  });

  it("maps safe service failures", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 401,
      code: "NOT_SIGNED_IN",
      message: "Sign in again.",
    });
    await expect(screenAml(input)).resolves.toMatchObject({
      ok: false,
      status: 401,
    });
  });
});

describe("admin AML history read (NFR-19)", () => {
  it("loads and validates the screening history", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue([record]);
    await expect(
      listAmlScreenings({ userId: "user-1", kind: "individual" }),
    ).resolves.toEqual({ status: "ready", screenings: [record] });
    expect(fetchApiJson).toHaveBeenCalledExactlyOnceWith(
      "/kyc/admin/aml/user-1",
      { token: "test-admin-session" },
    );
  });

  it.each(["denied", "preview", "expired", "unconfigured"])(
    "fails closed for a %s session",
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
      await expect(
        listAmlScreenings({ userId: "user-1", kind: "individual" }),
      ).resolves.toEqual({
        status: "unavailable",
        message: expect.any(String),
      });
      expect(fetchApiJson).not.toHaveBeenCalled();
    },
  );

  it("fails closed on an over-length or duplicated history", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => ({
        ...record,
        id: `screen-${index}`,
      })),
    );
    await expect(
      listAmlScreenings({ userId: "user-1", kind: "individual" }),
    ).resolves.toMatchObject({ status: "unavailable" });
    vi.mocked(fetchApiJson).mockResolvedValue([
      record,
      { ...record, id: "screen-1" },
    ]);
    await expect(
      listAmlScreenings({ userId: "user-1", kind: "business" }),
    ).resolves.toMatchObject({ status: "unavailable" });
    expect(fetchApiJson).toHaveBeenNthCalledWith(2, "/kyb/admin/aml/user-1", {
      token: "test-admin-session",
    });
  });

  it("reports an invalid payload instead of rendering it", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue([
      { ...record, createdAt: "yesterday" },
    ]);
    await expect(
      listAmlScreenings({ userId: "user-1", kind: "individual" }),
    ).resolves.toMatchObject({ status: "unavailable" });
  });

  it("maps service failures to recovery messages", async () => {
    const { ApiRequestError } = await import("@/lib/api/server");
    vi.mocked(fetchApiJson).mockRejectedValue(
      new ApiRequestError("Denied", 403, "FORBIDDEN"),
    );
    await expect(
      listAmlScreenings({ userId: "user-1", kind: "individual" }),
    ).resolves.toMatchObject({ status: "unavailable" });
  });
});
