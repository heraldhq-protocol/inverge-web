import { beforeEach, describe, expect, it, vi } from "vitest";

const isSameOriginRequestMock = vi.fn();
const getProgrammeAdminAccessMock = vi.fn();
const submitAdminCampaignReviewMock = vi.fn();
const isApiConfiguredMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/auth/server/origin", () => ({
  isSameOriginRequest: () => isSameOriginRequestMock(),
}));

vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: () => getProgrammeAdminAccessMock(),
}));

vi.mock("@/features/campaigns/server/admin-campaigns", () => ({
  submitAdminCampaignReview: (...args: unknown[]) => submitAdminCampaignReviewMock(...args),
}));

vi.mock("@/lib/api/server", () => ({
  isApiConfigured: () => isApiConfiguredMock(),
}));

import { POST } from "./route";

function makeRequest(body: unknown, sameOrigin = true): Request {
  isSameOriginRequestMock.mockReturnValue(sameOrigin);
  return new Request("http://localhost:3000/api/admin/campaigns/cmp-1/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeContext(id = "cmp-1") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  isSameOriginRequestMock.mockReset();
  getProgrammeAdminAccessMock.mockReset();
  submitAdminCampaignReviewMock.mockReset();
  isApiConfiguredMock.mockReset();
});

describe("POST /api/admin/campaigns/[id]/review", () => {
  it("rejects cross-origin requests", async () => {
    const res = await POST(makeRequest({ action: "approve" }, false), makeContext());
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error.code).toBe("ORIGIN_NOT_ALLOWED");
  });

  it("rejects unauthorized users", async () => {
    getProgrammeAdminAccessMock.mockResolvedValue({
      allowed: false,
      reason: "Not an admin",
    });

    const res = await POST(makeRequest({ action: "approve" }), makeContext());
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("validates request schema", async () => {
    getProgrammeAdminAccessMock.mockResolvedValue({
      allowed: true,
      preview: false,
      actor: { id: "a1", name: "Admin", role: "platform_lead" },
    });

    const res = await POST(makeRequest({ action: "invalid-action" }), makeContext());
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_FAILED");
  });

  it("requires reason of at least 20 chars for reject or request-changes", async () => {
    getProgrammeAdminAccessMock.mockResolvedValue({
      allowed: true,
      preview: false,
      actor: { id: "a1", name: "Admin", role: "platform_lead" },
    });

    const res = await POST(
      makeRequest({ action: "reject", reason: "Too short" }),
      makeContext(),
    );
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error.code).toBe("REASON_REQUIRED");
  });

  it("approves in preview mode without calling upstream API", async () => {
    getProgrammeAdminAccessMock.mockResolvedValue({
      allowed: true,
      preview: true,
      actor: { id: "a1", name: "Admin", role: "platform_lead" },
    });
    isApiConfiguredMock.mockReturnValue(false);

    const res = await POST(makeRequest({ action: "approve" }), makeContext());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.data.preview).toBe(true);
    expect(submitAdminCampaignReviewMock).not.toHaveBeenCalled();
  });

  it("forwards to live API when configured and authorized", async () => {
    getProgrammeAdminAccessMock.mockResolvedValue({
      allowed: true,
      preview: false,
      actor: { id: "a1", name: "Admin", role: "platform_lead" },
    });
    isApiConfiguredMock.mockReturnValue(true);
    submitAdminCampaignReviewMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true },
    });

    const res = await POST(makeRequest({ action: "approve" }), makeContext());
    expect(res.status).toBe(200);
    expect(submitAdminCampaignReviewMock).toHaveBeenCalledWith("cmp-1", {
      action: "APPROVE",
      reason: undefined,
    });
  });
});
