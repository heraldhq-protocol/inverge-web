import { z } from "zod";

export const EMAIL_TEMPLATE_IDS = [
  "VERIFICATION_CODE",
  "EMAIL_VERIFIED",
  "EMAIL_CHANGED",
  "IDEA_PUBLISHED",
  "IDEA_FEEDBACK",
  "IDEA_COMMENT",
  "WAITLIST_IDEA_LIVE",
  "IDEA_CONVERTED_TO_CAMPAIGN",
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
  "PROGRAMME_REGISTERED",
  "PROGRAMME_ENTRY_SUBMITTED",
  "PROGRAMME_ENTRY_DECISION",
  "PROGRAMME_RESULTS_PUBLISHED",
  "PROGRAMME_WINNER",
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

/**
 * The API returns the catalogue as
 * `{ id, category, label, requiredVariables, optionalVariables }` inside a
 * `{ data: [...] }` envelope. Normalise it to the browser shape once here so
 * the page, BFF and tests share the same contract. Already-normalised items
 * (`templateId`/`name`) are accepted too, so fixtures and any future flat
 * response are not rejected by the same reader.
 */
const catalogueTemplateSchema = z
  .object({
    id: z.string().min(1).optional(),
    templateId: z.string().min(1).optional(),
    category: z.string().optional().default("unknown"),
    label: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    requiredVariables: z.array(z.string()).optional().default([]),
    optionalVariables: z.array(z.string()).optional().default([]),
  })
  .refine((item) => Boolean(item.id ?? item.templateId), {
    message: "Template id is required",
    path: ["id"],
  })
  .transform((item) => {
    const templateId = (item.id ?? item.templateId)!;
    return {
      templateId,
      category: item.category,
      name: item.label ?? item.name ?? templateId,
      ...(item.description === undefined
        ? {}
        : { description: item.description }),
      requiredVariables: item.requiredVariables,
      optionalVariables: item.optionalVariables,
    };
  });

export const emailTemplateItemSchema = catalogueTemplateSchema;
export type EmailTemplateItem = z.infer<typeof emailTemplateItemSchema>;

export const emailTemplateListSchema = z.union([
  z.array(catalogueTemplateSchema),
  z
    .object({ data: z.array(catalogueTemplateSchema) })
    .transform((envelope) => envelope.data),
]);

/** Only marketing templates can be previewed or sent editorially. */
export function isEditorialTemplate(template: EmailTemplateItem): boolean {
  return template.category === "marketing";
}

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
  duplicate: z.number().int().optional(),
  exhausted: z.number().int().optional(),
  failed: z.number().int().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});
export type SendEditorialResult = z.infer<typeof sendEditorialResultSchema>;

export const previewEmailTemplates: EmailTemplateItem[] = [
  {
    templateId: "EDIT_INVERGE",
    category: "marketing",
    name: "Edit Inverge Weekly",
    description:
      "Weekly round-up of top ideas, milestones and builder stories.",
    requiredVariables: ["issueNumber", "headline", "featuredStoryHtml"],
    optionalVariables: [],
  },
  {
    templateId: "IDEA_OF_THE_WEEK",
    category: "marketing",
    name: "Idea of the Week",
    description: "Spotlight highlighting a standout community idea.",
    requiredVariables: ["ideaTitle", "creatorName", "summary", "ideaUrl"],
    optionalVariables: [],
  },
  {
    templateId: "EDITORS_PICK",
    category: "marketing",
    name: "Editor's Pick",
    description:
      "Curated selection of innovative campaigns reaching milestones.",
    requiredVariables: ["title", "curatorNote", "campaignListHtml"],
    optionalVariables: [],
  },
  {
    templateId: "CREATOR_OF_THE_WEEK",
    category: "marketing",
    name: "Creator of the Week",
    description: "Focus on African builders driving impactful technology.",
    requiredVariables: ["creatorName", "bio", "campaignTitle", "projectUrl"],
    optionalVariables: [],
  },
  {
    templateId: "UPCOMING_COMPETITIONS",
    category: "marketing",
    name: "Competitions & Grants",
    description: "Announcements of upcoming pitch rounds and grant programmes.",
    requiredVariables: ["competitionName", "prizePool", "deadline", "applyUrl"],
    optionalVariables: [],
  },
  {
    templateId: "CAMPAIGN_HIGHLIGHTS",
    category: "marketing",
    name: "Campaign Highlights",
    description: "Bi-weekly digest of trending campaigns nearing target.",
    requiredVariables: ["digestTitle", "highlightsHtml"],
    optionalVariables: [],
  },
  {
    templateId: "PLATFORM_ANNOUNCEMENT",
    category: "marketing",
    name: "Platform Announcement",
    description:
      "Important platform feature releases, policy changes and updates.",
    requiredVariables: ["headline", "bodyHtml", "actionText", "actionUrl"],
    optionalVariables: [],
  },
];

export const previewEditorialPreviewResult: PreviewEditorialResult = {
  subject: "Inverge Editorial: African Tech Founders Raising the Bar",
  text: "Hello Builders!\n\nWelcome to this week's edition of Inverge Editorial...\n\nKeep building,\nThe Inverge Team",
  html: "<div style='font-family:sans-serif;'><h2>Inverge Editorial</h2><p>Welcome to this week's edition of Inverge Editorial highlighting standout builders across Africa.</p><p>Keep building,<br><strong>The Inverge Team</strong></p></div>",
};
