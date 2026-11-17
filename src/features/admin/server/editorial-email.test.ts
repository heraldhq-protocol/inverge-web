import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  previewEditorialPreviewResult,
  previewEmailTemplates,
} from "@/features/admin/lib/editorial-email";
import {
  getEmailTemplates,
  previewEditorialEmail,
  sendEditorialEmail,
} from "./editorial-email";

const requireAdminApiSession = vi.fn();
const fetchApiJson = vi.fn();
const sendApiJson = vi.fn();

vi.mock("@/features/admin/server/admin-api", () => ({
  adminReadUnavailable: vi.fn((err) => ({
    status: "unavailable",
    message: err instanceof Error ? err.message : String(err),
  })),
  adminWriteFailure: vi.fn((res) => ({
    ok: false,
    status: res.status,
    code: res.code,
    message: res.message,
  })),
  requireAdminApiSession: () => requireAdminApiSession(),
}));

vi.mock("@/lib/api/server", () => ({
  fetchApiJson: (...args: unknown[]) => fetchApiJson(...args),
  sendApiJson: (...args: unknown[]) => sendApiJson(...args),
}));

describe("editorial-email server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmailTemplates", () => {
    it("returns parsed templates from service", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      fetchApiJson.mockResolvedValue([
        {
          templateId: "EDIT_INVERGE",
          category: "editorial",
          name: "Weekly Digest",
          requiredVariables: ["headline"],
        },
      ]);

      const res = await getEmailTemplates();
      expect(res.status).toBe("ready");
      if (res.status === "ready") {
        expect(res.data).toHaveLength(1);
        expect(res.data[0]?.templateId).toBe("EDIT_INVERGE");
      }
      expect(fetchApiJson).toHaveBeenCalledWith("/admin/email/templates", {
        token: "admin-jwt-token",
      });
    });

    it("returns preview fixtures in preview mode", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "preview",
      });

      const res = await getEmailTemplates();
      expect(res.status).toBe("ready");
      if (res.status === "ready") {
        expect(res.data).toEqual(previewEmailTemplates);
      }
      expect(fetchApiJson).not.toHaveBeenCalled();
    });
  });

  describe("previewEditorialEmail", () => {
    it("returns preview rendering from service", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      sendApiJson.mockResolvedValue({
        ok: true,
        status: 201,
        data: {
          subject: "Test Subject",
          html: "<p>Test</p>",
          text: "Test",
        },
      });

      const res = await previewEditorialEmail({
        templateId: "EDIT_INVERGE",
        variables: { issueNumber: 1 },
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.preview.subject).toBe("Test Subject");
      }
      expect(sendApiJson).toHaveBeenCalledWith(
        "/admin/email/editorial/preview",
        {
          method: "POST",
          token: "admin-jwt-token",
          body: {
            templateId: "EDIT_INVERGE",
            variables: { issueNumber: 1 },
          },
        },
      );
    });

    it("returns mock preview in preview session", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "preview",
      });

      const res = await previewEditorialEmail({
        templateId: "EDIT_INVERGE",
        variables: {},
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.preview).toEqual(previewEditorialPreviewResult);
      }
      expect(sendApiJson).not.toHaveBeenCalled();
    });
  });

  describe("sendEditorialEmail", () => {
    it("blocks preview sessions from sending live emails", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "preview",
      });

      const res = await sendEditorialEmail({
        issueId: "issue-1",
        templateId: "EDIT_INVERGE",
        userIds: ["usr_1"],
        variables: {},
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("PREVIEW_MODE");
      }
      expect(sendApiJson).not.toHaveBeenCalled();
    });

    it("sends dispatch request and confirms delivery summary", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      sendApiJson.mockResolvedValue({
        ok: true,
        status: 201,
        data: {
          issueId: "issue-1",
          sentCount: 50,
          suppressedCount: 2,
        },
      });

      const res = await sendEditorialEmail({
        issueId: "issue-1",
        templateId: "EDIT_INVERGE",
        userIds: ["usr_1"],
        variables: { issueNumber: 42 },
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.result.sentCount).toBe(50);
        expect(res.result.suppressedCount).toBe(2);
      }
      expect(sendApiJson).toHaveBeenCalledWith("/admin/email/editorial/send", {
        method: "POST",
        token: "admin-jwt-token",
        body: {
          issueId: "issue-1",
          templateId: "EDIT_INVERGE",
          userIds: ["usr_1"],
          variables: { issueNumber: 42 },
        },
      });
    });

    it("surfaces 500 error as unconfirmed dispatch", async () => {
      requireAdminApiSession.mockResolvedValue({
        ok: true,
        token: "admin-jwt-token",
      });
      sendApiJson.mockResolvedValue({
        ok: false,
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Email provider timeout",
      });

      const res = await sendEditorialEmail({
        issueId: "issue-1",
        templateId: "EDIT_INVERGE",
        userIds: ["usr_1"],
        variables: {},
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.message).toContain("did not confirm");
      }
    });
  });
});
