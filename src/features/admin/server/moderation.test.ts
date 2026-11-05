import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(),
}));
vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: vi.fn(),
}));
vi.mock("@/lib/api/server", async (original) => ({
  ...(await original<typeof import("@/lib/api/server")>()),
  sendApiJson: vi.fn(),
  isApiConfigured: vi.fn(),
}));

import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import { sendApiJson, isApiConfigured } from "@/lib/api/server";
import { screenContent } from "./moderation";

const access = {
  allowed: true as const,
  preview: false,
  actor: { id: "admin-1", name: "Admin", role: "platform_admin" as const },
  reason: "Admin",
};
const input = { kind: "idea", text: "A repair workshop for students." };
const record = {
  id: "case-1",
  kind: "idea",
  ideaId: null,
  campaignId: null,
  submittedById: "admin-1",
  decision: "AUTO_CLEAR",
  maxRisk: "0",
  categories: [],
  reasonCodes: [],
  internalReason: "No findings.",
  externalReason: "",
  brief: "No flags.",
  provider: "stub",
  policyVersion: "2026-07-25",
  createdAt: "2026-11-05T12:00:00Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue(access);
  vi.mocked(readSessionToken).mockResolvedValue("test-admin-session");
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(sendApiJson).mockResolvedValue({
    ok: true,
    status: 201,
    data: record,
  });
});

describe("admin screening service (FR-901, NFR-14)", () => {
  it("sends only the validated content and returns a confirmed advisory case", async () => {
    expect(await screenContent(input)).toMatchObject({
      ok: true,
      screening: { id: "case-1", maxRisk: 0, decision: "AUTO_CLEAR" },
    });
    expect(sendApiJson).toHaveBeenCalledExactlyOnceWith(
      "/admin/moderation/screen",
      {
        method: "POST",
        token: "test-admin-session",
        body: input,
        timeoutMs: 45_000,
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
      expect(await screenContent(input)).toMatchObject({ ok: false });
      expect(sendApiJson).not.toHaveBeenCalled();
    },
  );
  it("refuses client-selected actor and listing identifiers", async () => {
    expect(
      await screenContent({
        ...input,
        submittedById: "creator-1",
        ideaId: "idea-1",
      }),
    ).toMatchObject({ ok: false, status: 422 });
    expect(sendApiJson).not.toHaveBeenCalled();
  });
  it.each([
    { kind: "campaign" },
    { submittedById: "another-admin" },
    { ideaId: "idea-1" },
    { decision: "PUBLISHED" },
  ])("rejects unrelated or invalid receipts", async (changes) => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 201,
      data: { ...record, ...changes },
    });
    expect(await screenContent(input)).toMatchObject({
      ok: false,
      status: 502,
      code: "INVALID_RESPONSE",
    });
  });
  it("does not retry or claim nothing happened after a timeout", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 503,
      code: "API_UNREACHABLE",
      message: "Nothing was changed.",
    });
    const result = await screenContent(input);
    expect(result).toMatchObject({
      ok: false,
      status: 503,
      message: expect.stringContaining("may already have been saved"),
    });
    expect(sendApiJson).toHaveBeenCalledTimes(1);
  });
});
