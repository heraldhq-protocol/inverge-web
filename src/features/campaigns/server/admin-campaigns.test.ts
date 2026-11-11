import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/server")>()),
  fetchApiJson: vi.fn(),
  isApiConfigured: vi.fn(),
  sendApiJson: vi.fn(),
}));
vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(),
}));

import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
  sendApiJson,
} from "@/lib/api/server";
import { readSessionToken } from "@/features/auth/server/session";
import {
  reviewDecisionFixture,
  reviewDetailFixture,
  reviewQueueFixture,
} from "@/test/admin-campaign-review";
import {
  getAdminCampaigns,
  getAdminCampaignDetail,
  submitAdminCampaignReview,
} from "./admin-campaigns";

const query = { reviewStatus: "IN_REVIEW", skip: 0, take: 50 } as const;
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(isApiConfigured).mockReturnValue(true);
  vi.mocked(readSessionToken).mockResolvedValue("test-session");
});

describe("FR-304 admin campaign API reads", () => {
  it("reads the paginated items contract with a private session", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue(reviewQueueFixture());
    const result = await getAdminCampaigns(query);
    expect(fetchApiJson).toHaveBeenCalledWith(
      "/admin/campaigns?reviewStatus=IN_REVIEW&skip=0&take=50",
      { token: "test-session" },
    );
    expect(result.status).toBe("ready");
    if (result.status === "ready")
      expect(result.data.items[0]?.targetAmount).toBe("25000.25");
  });
  it("forwards status and pagination without silently limiting the queue to pending", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue({
      items: [],
      total: 0,
      reviewStatus: "APPROVED",
      skip: 50,
      take: 50,
    });
    expect(
      (
        await getAdminCampaigns({
          ...query,
          reviewStatus: "APPROVED",
          skip: 50,
        })
      ).status,
    ).toBe("ready");
    expect(fetchApiJson).toHaveBeenCalledWith(
      "/admin/campaigns?reviewStatus=APPROVED&skip=50&take=50",
      { token: "test-session" },
    );
  });
  it.each(["configuration", "session", "network", "malformed"])(
    "never substitutes fixtures after a %s failure",
    async (failure) => {
      if (failure === "configuration")
        vi.mocked(isApiConfigured).mockReturnValue(false);
      if (failure === "session")
        vi.mocked(readSessionToken).mockResolvedValue(null);
      if (failure === "network")
        vi.mocked(fetchApiJson).mockRejectedValue(
          new ApiRequestError("Unavailable", 503, "API_UNAVAILABLE"),
        );
      if (failure === "malformed")
        vi.mocked(fetchApiJson).mockResolvedValue({ data: [] });
      expect((await getAdminCampaigns(query)).status).toBe("unavailable");
      expect(
        (await getAdminCampaignDetail("campaign-naija-craft")).status,
      ).toBe("unavailable");
      if (failure === "configuration" || failure === "session")
        expect(fetchApiJson).not.toHaveBeenCalled();
    },
  );
  it("distinguishes a real 404 from an unavailable detail", async () => {
    vi.mocked(fetchApiJson).mockRejectedValue(
      new ApiRequestError("Not found", 404, "NOT_FOUND"),
    );
    expect(await getAdminCampaignDetail("missing")).toEqual({
      status: "not-found",
    });
  });
  it("keeps preconditions and actual history separate from the campaign lifecycle", async () => {
    const detail = reviewDetailFixture();
    detail.campaign.reviewStatus = "APPROVED";
    detail.campaign.reviewedAt = reviewDecisionFixture().reviewedAt;
    detail.reviewEvents = [reviewDecisionFixture().event];
    vi.mocked(fetchApiJson).mockResolvedValue(detail);
    const result = await getAdminCampaignDetail("campaign-test");
    expect(result).toEqual({ status: "ready", data: detail });
    expect(detail.campaign.status).toBe("IN_REVIEW");
  });
  it("rejects a response for another campaign or page", async () => {
    vi.mocked(fetchApiJson).mockResolvedValue(reviewDetailFixture());
    expect((await getAdminCampaignDetail("different-id")).status).toBe(
      "unavailable",
    );
    vi.mocked(fetchApiJson).mockResolvedValue({
      ...reviewQueueFixture(),
      skip: 50,
    });
    expect((await getAdminCampaigns(query)).status).toBe("unavailable");
  });
});

describe("FR-304 / FR-901 review writes", () => {
  it("requires a real configured session", async () => {
    vi.mocked(readSessionToken).mockResolvedValue(null);
    expect(
      await submitAdminCampaignReview("campaign-test", { action: "APPROVE" }),
    ).toMatchObject({ ok: false, status: 401 });
    vi.mocked(isApiConfigured).mockReturnValue(false);
    expect(
      await submitAdminCampaignReview("campaign-test", { action: "APPROVE" }),
    ).toMatchObject({ ok: false, status: 503 });
    expect(sendApiJson).not.toHaveBeenCalled();
  });
  it("returns a validated authoritative receipt", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 201,
      data: reviewDecisionFixture(),
    });
    expect(
      await submitAdminCampaignReview("campaign-test", { action: "APPROVE" }),
    ).toMatchObject({ ok: true, data: reviewDecisionFixture() });
    expect(sendApiJson).toHaveBeenCalledWith(
      "/admin/campaigns/campaign-test/review",
      { method: "POST", token: "test-session", body: { action: "APPROVE" } },
    );
  });
  it.each([
    null,
    { success: true },
    { ...reviewDecisionFixture(), id: "other" },
    { ...reviewDecisionFixture(), reviewStatus: "REJECTED" },
  ])("rejects an unconfirmed success payload", async (data) => {
    vi.mocked(sendApiJson).mockResolvedValue({ ok: true, status: 200, data });
    expect(
      await submitAdminCampaignReview("campaign-test", { action: "APPROVE" }),
    ).toMatchObject({
      ok: false,
      status: 502,
      code: "INVALID_REVIEW_RESPONSE",
    });
  });
  it("does not accept a different action's receipt", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 200,
      data: reviewDecisionFixture(),
    });
    expect(
      await submitAdminCampaignReview("campaign-test", {
        action: "REJECT",
        reason: "Please clarify the milestone evidence.",
      }),
    ).toMatchObject({ ok: false, status: 502 });
  });
  it("does not confirm a receipt with a different reason", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: true,
      status: 200,
      data: reviewDecisionFixture(),
    });
    expect(
      await submitAdminCampaignReview("campaign-test", {
        action: "APPROVE",
        reason: "Reviewed with conditions",
      }),
    ).toMatchObject({ ok: false, status: 502 });
  });
  it("preserves stale-state and approval blocker failures", async () => {
    const failure = {
      ok: false,
      status: 422,
      code: "VERIFICATION_REQUIRED",
      message: "Verification is required",
      details: { blockers: ["Compliance hold"] },
    } as const;
    vi.mocked(sendApiJson).mockResolvedValue(failure);
    expect(
      await submitAdminCampaignReview("campaign-test", { action: "APPROVE" }),
    ).toEqual(failure);
  });
  it("does not claim a network failure means no write occurred", async () => {
    vi.mocked(sendApiJson).mockResolvedValue({
      ok: false,
      status: 503,
      code: "API_UNREACHABLE",
      message: "Nothing was changed.",
    });
    expect(
      await submitAdminCampaignReview("campaign-test", { action: "APPROVE" }),
    ).toMatchObject({
      ok: false,
      message: expect.stringContaining("Refresh the review"),
    });
  });
});
