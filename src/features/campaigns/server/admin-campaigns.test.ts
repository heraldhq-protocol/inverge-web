import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/server")>();
  return {
    ...actual,
    fetchApiJson: vi.fn(),
    isApiConfigured: vi.fn(),
    sendApiJson: vi.fn(),
  };
});

vi.mock("@/features/auth/server/session", () => ({
  readSessionToken: vi.fn(),
}));

import { fetchApiJson, isApiConfigured, sendApiJson } from "@/lib/api/server";
import { readSessionToken } from "@/features/auth/server/session";
import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import {
  getAdminCampaigns,
  getAdminCampaignDetail,
  submitAdminCampaignReview,
} from "./admin-campaigns";

const fetchMock = vi.mocked(fetchApiJson);
const isApiConfiguredMock = vi.mocked(isApiConfigured);
const sendApiJsonMock = vi.mocked(sendApiJson);
const readSessionTokenMock = vi.mocked(readSessionToken);

beforeEach(() => {
  fetchMock.mockReset();
  isApiConfiguredMock.mockReset();
  sendApiJsonMock.mockReset();
  readSessionTokenMock.mockReset();
});

describe("admin campaigns server helper", () => {
  describe("getAdminCampaigns", () => {
    it("returns preview campaigns when API is unconfigured", async () => {
      isApiConfiguredMock.mockReturnValue(false);
      const result = await getAdminCampaigns();
      expect(result).toEqual(previewCampaigns);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns preview campaigns when user has no session token", async () => {
      isApiConfiguredMock.mockReturnValue(true);
      readSessionTokenMock.mockResolvedValue(null);
      const result = await getAdminCampaigns();
      expect(result).toEqual(previewCampaigns);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("fetches live admin campaigns when configured and authorized", async () => {
      isApiConfiguredMock.mockReturnValue(true);
      readSessionTokenMock.mockResolvedValue("test-token");
      fetchMock.mockResolvedValue([
        {
          id: "camp-1",
          status: "IN_REVIEW",
          reviewStatus: "IN_REVIEW",
          targetAmount: "10000",
          totalRaised: "0",
          idea: {
            title: "Clean Water Tech",
            problem: "No clean water",
            region: "Nairobi",
          },
        },
      ]);

      const result = await getAdminCampaigns({ reviewStatus: "ALL" });
      expect(fetchMock).toHaveBeenCalledWith("/admin/campaigns?reviewStatus=ALL", {
        token: "test-token",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("camp-1");
      expect(result[0]?.title).toBe("Clean Water Tech");
      expect(result[0]?.phase).toBe("in-review");
    });
  });

  describe("getAdminCampaignDetail", () => {
    it("returns preview campaign if API is unconfigured", async () => {
      isApiConfiguredMock.mockReturnValue(false);
      const result = await getAdminCampaignDetail("campaign-sungrid");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("campaign-sungrid");
    });

    it("fetches campaign detail from live API when configured", async () => {
      isApiConfiguredMock.mockReturnValue(true);
      readSessionTokenMock.mockResolvedValue("test-token");
      fetchMock.mockResolvedValue({
        id: "camp-2",
        status: "APPROVED",
        reviewStatus: "APPROVED",
        targetAmount: "5000",
        idea: {
          title: "Solar Pump",
          solution: "Solar irrigation",
        },
      });

      const result = await getAdminCampaignDetail("camp-2");
      expect(fetchMock).toHaveBeenCalledWith("/admin/campaigns/camp-2", {
        token: "test-token",
      });
      expect(result?.id).toBe("camp-2");
      expect(result?.title).toBe("Solar Pump");
      expect(result?.review.status).toBe("approved");
    });
  });

  describe("submitAdminCampaignReview", () => {
    it("rejects immediately if not signed in", async () => {
      readSessionTokenMock.mockResolvedValue(null);
      const result = await submitAdminCampaignReview("camp-1", {
        action: "APPROVE",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("NOT_SIGNED_IN");
      }
      expect(sendApiJsonMock).not.toHaveBeenCalled();
    });

    it("posts review decision with token when signed in", async () => {
      readSessionTokenMock.mockResolvedValue("test-token");
      sendApiJsonMock.mockResolvedValue({
        ok: true,
        status: 200,
        data: { success: true },
      });

      const result = await submitAdminCampaignReview("camp-1", {
        action: "APPROVE",
      });
      expect(sendApiJsonMock).toHaveBeenCalledWith("/admin/campaigns/camp-1/review", {
        method: "POST",
        token: "test-token",
        body: { action: "APPROVE" },
      });
      expect(result.ok).toBe(true);
    });
  });
});
