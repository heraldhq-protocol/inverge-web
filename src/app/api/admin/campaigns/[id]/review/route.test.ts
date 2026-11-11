import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/auth/server/origin", () => ({
  isSameOriginRequest: vi.fn(),
}));
vi.mock("@/features/programmes/server/access", () => ({
  getProgrammeAdminAccess: vi.fn(),
}));
vi.mock("@/features/campaigns/server/admin-campaigns", () => ({
  submitAdminCampaignReview: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import { submitAdminCampaignReview } from "@/features/campaigns/server/admin-campaigns";
import { reviewDecisionFixture } from "@/test/admin-campaign-review";
import { POST } from "./route";

const access = {
  allowed: true,
  preview: false,
  actor: { id: "admin-test", name: "Reviewer", role: "platform_admin" },
  reason: "Admin",
} as const;
const context = () => ({ params: Promise.resolve({ id: "campaign-test" }) });
const request = (body: unknown) =>
  new Request(
    "http://localhost:3000/api/admin/campaigns/campaign-test/review",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(isSameOriginRequest).mockReturnValue(true);
  vi.mocked(getProgrammeAdminAccess).mockResolvedValue(access);
  vi.mocked(submitAdminCampaignReview).mockResolvedValue({
    ok: true,
    status: 201,
    data: reviewDecisionFixture(),
  });
});

describe("FR-901 same-origin admin review BFF", () => {
  it("refuses cross-site requests before reading the session", async () => {
    vi.mocked(isSameOriginRequest).mockReturnValue(false);
    expect((await POST(request({ action: "APPROVE" }), context())).status).toBe(
      403,
    );
    expect(getProgrammeAdminAccess).not.toHaveBeenCalled();
    expect(submitAdminCampaignReview).not.toHaveBeenCalled();
  });
  it("refuses a non-admin and a preview identity", async () => {
    vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
      allowed: false,
      preview: false,
      reason: "Admin required",
    });
    expect((await POST(request({ action: "APPROVE" }), context())).status).toBe(
      403,
    );
    vi.mocked(getProgrammeAdminAccess).mockResolvedValue({
      ...access,
      preview: true,
    });
    expect((await POST(request({ action: "APPROVE" }), context())).status).toBe(
      503,
    );
    expect(submitAdminCampaignReview).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost:3000", { method: "POST", body: "{" }),
      context(),
    );
    expect(response.status).toBe(400);
  });
  it.each([
    { action: "invalid" },
    {},
    { action: "REJECT" },
    { action: "REQUEST_CHANGES", reason: "Too short" },
    { action: "APPROVE", reason: "x".repeat(2001) },
  ])(
    "validates decisions and reason limits before the API call",
    async (body) => {
      expect((await POST(request(body), context())).status).toBe(422);
      expect(submitAdminCampaignReview).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
  it("sends the documented action and returns one consistent live envelope", async () => {
    const response = await POST(
      request({ action: "approve", reason: "  Reviewed plan  " }),
      context(),
    );
    expect(submitAdminCampaignReview).toHaveBeenCalledWith("campaign-test", {
      action: "APPROVE",
      reason: "Reviewed plan",
    });
    expect(await response.json()).toEqual({
      mode: "live",
      decision: reviewDecisionFixture(),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/campaigns");
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/campaigns/campaign-test",
    );
  });
  it.each([401, 403, 409, 422, 503, 0])(
    "forwards API failure %s without fake preview success",
    async (status) => {
      vi.mocked(submitAdminCampaignReview).mockResolvedValue({
        ok: false,
        status,
        code: "REVIEW_FAILED",
        message: "Review refused",
        details: { blockers: ["A verification check changed"] },
      });
      const response = await POST(request({ action: "APPROVE" }), context());
      expect(response.status).toBe(status || 502);
      expect(await response.json()).toMatchObject({
        error: {
          code: "REVIEW_FAILED",
          details: { blockers: ["A verification check changed"] },
        },
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});
