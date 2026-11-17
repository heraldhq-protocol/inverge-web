import { describe, expect, it } from "vitest";

import {
  emailTemplateIdSchema,
  emailTemplateListSchema,
  previewEditorialResultSchema,
  previewEditorialSchema,
  sendEditorialResultSchema,
  sendEditorialSchema,
} from "./editorial-email";

describe("editorial-email lib schemas", () => {
  describe("emailTemplateIdSchema", () => {
    it("validates recognized template IDs", () => {
      expect(emailTemplateIdSchema.parse("EDIT_INVERGE")).toBe("EDIT_INVERGE");
      expect(emailTemplateIdSchema.parse("PLATFORM_ANNOUNCEMENT")).toBe(
        "PLATFORM_ANNOUNCEMENT",
      );
      expect(emailTemplateIdSchema.parse("CAMPAIGN_FUNDED")).toBe(
        "CAMPAIGN_FUNDED",
      );
    });

    it("rejects unknown template IDs", () => {
      expect(() => emailTemplateIdSchema.parse("UNKNOWN_TEMPLATE")).toThrow();
    });
  });

  describe("emailTemplateListSchema", () => {
    it("parses valid template item arrays", () => {
      const parsed = emailTemplateListSchema.parse([
        {
          templateId: "EDIT_INVERGE",
          category: "editorial",
          name: "Edit Inverge Weekly",
          requiredVariables: ["headline", "featuredStoryHtml"],
        },
      ]);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.templateId).toBe("EDIT_INVERGE");
      expect(parsed[0]?.requiredVariables).toContain("headline");
    });
  });

  describe("previewEditorialSchema", () => {
    it("validates preview requests", () => {
      const parsed = previewEditorialSchema.parse({
        templateId: "IDEA_OF_THE_WEEK",
        variables: {
          ideaTitle: "Clean Energy Microgrid",
          creatorName: "Amara",
        },
      });
      expect(parsed.templateId).toBe("IDEA_OF_THE_WEEK");
      expect(parsed.variables.ideaTitle).toBe("Clean Energy Microgrid");
    });

    it("requires templateId", () => {
      expect(() =>
        previewEditorialSchema.parse({
          templateId: "",
          variables: {},
        }),
      ).toThrow();
    });
  });

  describe("previewEditorialResultSchema", () => {
    it("validates preview result payload", () => {
      const parsed = previewEditorialResultSchema.parse({
        subject: "Weekly Highlights",
        html: "<p>Hello</p>",
        text: "Hello",
      });
      expect(parsed.subject).toBe("Weekly Highlights");
      expect(parsed.html).toBe("<p>Hello</p>");
      expect(parsed.text).toBe("Hello");
    });
  });

  describe("sendEditorialSchema", () => {
    it("validates complete send payload", () => {
      const parsed = sendEditorialSchema.parse({
        issueId: "issue-2026-w46",
        templateId: "EDIT_INVERGE",
        userIds: ["usr_1", "usr_2"],
        variables: {
          issueNumber: 46,
        },
      });
      expect(parsed.issueId).toBe("issue-2026-w46");
      expect(parsed.userIds).toHaveLength(2);
    });

    it("rejects empty userIds or missing issueId", () => {
      expect(() =>
        sendEditorialSchema.parse({
          issueId: "",
          templateId: "EDIT_INVERGE",
          userIds: ["usr_1"],
          variables: {},
        }),
      ).toThrow();

      expect(() =>
        sendEditorialSchema.parse({
          issueId: "issue-1",
          templateId: "EDIT_INVERGE",
          userIds: [],
          variables: {},
        }),
      ).toThrow();
    });
  });

  describe("sendEditorialResultSchema", () => {
    it("parses delivery confirmation", () => {
      const parsed = sendEditorialResultSchema.parse({
        issueId: "issue-1",
        sentCount: 150,
        suppressedCount: 12,
        status: "DELIVERED",
      });
      expect(parsed.sentCount).toBe(150);
      expect(parsed.suppressedCount).toBe(12);
    });
  });
});
