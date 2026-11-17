import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST as previewPost } from "./editorial/preview/route";
import { POST as sendPost } from "./editorial/send/route";
import { GET as templatesGet } from "./templates/route";

const isSameOriginRequest = vi.fn();
const getEmailTemplates = vi.fn();
const previewEditorialEmail = vi.fn();
const sendEditorialEmail = vi.fn();

vi.mock("@/features/auth/server/origin", () => ({
  isSameOriginRequest: (req: Request) => isSameOriginRequest(req),
}));

vi.mock("@/features/admin/server/editorial-email", () => ({
  getEmailTemplates: () => getEmailTemplates(),
  previewEditorialEmail: (body: unknown) => previewEditorialEmail(body),
  sendEditorialEmail: (body: unknown) => sendEditorialEmail(body),
}));

describe("BFF /api/admin/email routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /templates", () => {
    it("returns template list when ready", async () => {
      getEmailTemplates.mockResolvedValue({
        status: "ready",
        data: [{ templateId: "EDIT_INVERGE", name: "Inverge Weekly" }],
      });

      const res = await templatesGet();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.templates).toHaveLength(1);
    });

    it("returns 503 when service is unavailable", async () => {
      getEmailTemplates.mockResolvedValue({
        status: "unavailable",
        message: "Templates service down",
      });

      const res = await templatesGet();
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.ok).toBe(false);
      expect(json.message).toBe("Templates service down");
    });
  });

  describe("POST /editorial/preview", () => {
    it("blocks cross-site requests", async () => {
      isSameOriginRequest.mockReturnValue(false);

      const req = new Request(
        "http://localhost:3000/api/admin/email/editorial/preview",
        {
          method: "POST",
          body: JSON.stringify({ templateId: "EDIT_INVERGE", variables: {} }),
        },
      );

      const res = await previewPost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe("ORIGIN_NOT_ALLOWED");
      expect(previewEditorialEmail).not.toHaveBeenCalled();
    });

    it("returns rendered preview on valid same-origin request", async () => {
      isSameOriginRequest.mockReturnValue(true);
      previewEditorialEmail.mockResolvedValue({
        ok: true,
        preview: {
          subject: "Test Subject",
          html: "<p>Test</p>",
          text: "Test",
        },
      });

      const req = new Request(
        "http://localhost:3000/api/admin/email/editorial/preview",
        {
          method: "POST",
          body: JSON.stringify({
            templateId: "EDIT_INVERGE",
            variables: { headline: "African Builders" },
          }),
        },
      );

      const res = await previewPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.preview.subject).toBe("Test Subject");
    });
  });

  describe("POST /editorial/send", () => {
    it("blocks cross-site requests", async () => {
      isSameOriginRequest.mockReturnValue(false);

      const req = new Request(
        "http://localhost:3000/api/admin/email/editorial/send",
        {
          method: "POST",
          body: JSON.stringify({
            issueId: "iss-1",
            templateId: "EDIT_INVERGE",
            userIds: ["usr-1"],
            variables: {},
          }),
        },
      );

      const res = await sendPost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe("ORIGIN_NOT_ALLOWED");
      expect(sendEditorialEmail).not.toHaveBeenCalled();
    });

    it("confirms dispatch on valid same-origin request", async () => {
      isSameOriginRequest.mockReturnValue(true);
      sendEditorialEmail.mockResolvedValue({
        ok: true,
        result: {
          issueId: "iss-1",
          sentCount: 100,
          suppressedCount: 5,
        },
      });

      const req = new Request(
        "http://localhost:3000/api/admin/email/editorial/send",
        {
          method: "POST",
          body: JSON.stringify({
            issueId: "iss-1",
            templateId: "EDIT_INVERGE",
            userIds: ["usr-1"],
            variables: {},
          }),
        },
      );

      const res = await sendPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.result.sentCount).toBe(100);
    });
  });
});
