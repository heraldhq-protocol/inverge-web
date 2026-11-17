import { z } from "zod";

export const EMAIL_TEMPLATE_IDS = [
  "VERIFICATION_CODE",
  "EMAIL_VERIFIED",
  "EMAIL_CHANGED",
  "IDEA_PUBLISHED",
  "IDEA_FEEDBACK",
  "IDEA_COMMENT",
  "WAITLIST_IDEA_LIVE",
  "ACCOUNT_UPDATE",
  "CAMPAIGN_SUBMITTED",
  "CAMPAIGN_APPROVED",
  "CAMPAIGN_CHANGES_REQUESTED",
  "CAMPAIGN_PUBLISHED",
  "CAMPAIGN_FUNDED",
  "MILESTONE_REVIEW",
  "KYC_APPROVED",
  "KYC_DECLINED",
  "KYC_ACTION_REQUIRED",
  "AML_REVIEW",
  "AML_CLEAR",
  "EDIT_INVERGE",
  "IDEA_OF_THE_WEEK",
  "EDITORS_PICK",
  "CREATOR_OF_THE_WEEK",
  "UPCOMING_COMPETITIONS",
  "CAMPAIGN_HIGHLIGHTS",
  "PLATFORM_ANNOUNCEMENT",
] as const;

export const EDITORIAL_TEMPLATE_IDS = [
  "EDIT_INVERGE",
  "IDEA_OF_THE_WEEK",
  "EDITORS_PICK",
  "CREATOR_OF_THE_WEEK",
  "UPCOMING_COMPETITIONS",
  "CAMPAIGN_HIGHLIGHTS",
  "PLATFORM_ANNOUNCEMENT",
] as const;

export const emailTemplateIdSchema = z.enum(EMAIL_TEMPLATE_IDS);
export type EmailTemplateId = z.infer<typeof emailTemplateIdSchema>;

export const emailTemplateItemSchema = z.object({
  templateId: z.string(),
  category: z.string().optional().default("editorial"),
  name: z.string().optional(),
  description: z.string().optional(),
  requiredVariables: z.array(z.string()).optional().default([]),
});
export type EmailTemplateItem = z.infer<typeof emailTemplateItemSchema>;

export const emailTemplateListSchema = z.array(emailTemplateItemSchema);

export const previewEditorialSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  variables: z.record(z.string(), z.unknown()).default({}),
});
export type PreviewEditorialInput = z.infer<typeof previewEditorialSchema>;

export const previewEditorialResultSchema = z.object({
  subject: z.string(),
  html: z.string(),
  text: z.string(),
});
export type PreviewEditorialResult = z.infer<
  typeof previewEditorialResultSchema
>;

export const sendEditorialSchema = z.object({
  issueId: z.string().min(1, "Issue ID is required"),
  templateId: z.string().min(1, "Template ID is required"),
  userIds: z
    .array(z.string().min(1))
    .min(1, "At least one recipient user ID is required"),
  variables: z.record(z.string(), z.unknown()).default({}),
});
export type SendEditorialInput = z.infer<typeof sendEditorialSchema>;

export const sendEditorialResultSchema = z.object({
  issueId: z.string().optional(),
  sentCount: z.number().int().optional(),
  sent: z.number().int().optional(),
  suppressedCount: z.number().int().optional(),
  suppressed: z.number().int().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});
export type SendEditorialResult = z.infer<typeof sendEditorialResultSchema>;

export const previewEmailTemplates: EmailTemplateItem[] = [
  {
    templateId: "EDIT_INVERGE",
    category: "editorial",
    name: "Edit Inverge Weekly",
    description: "Weekly round-up of top ideas, milestones and builder stories.",
    requiredVariables: ["issueNumber", "headline", "featuredStoryHtml"],
  },
  {
    templateId: "IDEA_OF_THE_WEEK",
    category: "editorial",
    name: "Idea of the Week",
    description: "Spotlight highlighting a standout community idea.",
    requiredVariables: ["ideaTitle", "creatorName", "summary", "ideaUrl"],
  },
  {
    templateId: "EDITORS_PICK",
    category: "editorial",
    name: "Editor's Pick",
    description: "Curated selection of innovative campaigns reaching milestones.",
    requiredVariables: ["title", "curatorNote", "campaignListHtml"],
  },
  {
    templateId: "CREATOR_OF_THE_WEEK",
    category: "editorial",
    name: "Creator of the Week",
    description: "Focus on African builders driving impactful technology.",
    requiredVariables: ["creatorName", "bio", "campaignTitle", "projectUrl"],
  },
  {
    templateId: "UPCOMING_COMPETITIONS",
    category: "editorial",
    name: "Competitions & Grants",
    description: "Announcements of upcoming pitch rounds and grant programmes.",
    requiredVariables: ["competitionName", "prizePool", "deadline", "applyUrl"],
  },
  {
    templateId: "CAMPAIGN_HIGHLIGHTS",
    category: "editorial",
    name: "Campaign Highlights",
    description: "Bi-weekly digest of trending campaigns nearing target.",
    requiredVariables: ["digestTitle", "highlightsHtml"],
  },
  {
    templateId: "PLATFORM_ANNOUNCEMENT",
    category: "editorial",
    name: "Platform Announcement",
    description: "Important platform feature releases, policy changes and updates.",
    requiredVariables: ["headline", "bodyHtml", "actionText", "actionUrl"],
  },
];

export const previewEditorialPreviewResult: PreviewEditorialResult = {
  subject: "Inverge Editorial: African Tech Founders Raising the Bar",
  text: "Hello Builders!\n\nWelcome to this week's edition of Inverge Editorial...\n\nKeep building,\nThe Inverge Team",
  html: "<div style='font-family:sans-serif;'><h2>Inverge Editorial</h2><p>Welcome to this week's edition of Inverge Editorial highlighting standout builders across Africa.</p><p>Keep building,<br><strong>The Inverge Team</strong></p></div>",
};
