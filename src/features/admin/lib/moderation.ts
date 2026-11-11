import { z } from "zod";

export const SCREENING_TIMEOUT_MS = 45_000;

/** FR-901 / NFR-14: only the documented content fields may reach screening. */
export const screenContentSchema = z
  .object({
    kind: z.enum(["idea", "campaign"]),
    title: z
      .string()
      .trim()
      .max(200, "Keep the title within 200 characters.")
      .optional(),
    text: z
      .string()
      .trim()
      .min(1, "Enter the text to screen.")
      .max(20_000, "Keep the text within 20,000 characters."),
  })
  .strict();
export type ScreenContent = z.infer<typeof screenContentSchema>;

export const POLICY_LABELS = {
  "POL-SEC": "Financial return claims",
  "POL-AML": "Financial crime signals",
  "POL-FRD": "Fraud or duplicate content",
  "POL-CAT": "Prohibited categories",
  "POL-IP": "Impersonation or infringement",
  "POL-MIS": "Misleading claims",
} as const;
const policyCode = z.enum([
  "POL-SEC",
  "POL-AML",
  "POL-FRD",
  "POL-CAT",
  "POL-IP",
  "POL-MIS",
]);
const riskScore = z.number().min(0).max(1);
const reasonCode = z.enum([
  ...policyCode.options,
  "L1-SUBMITTER-BANNED",
  "L1-SUBMITTER-SANCTIONED",
]);

/**
 * The OpenAPI response is unspecified. This follows ModerationCase and the
 * classifier port at API c3e23b0; Decimal maxRisk is serialized as a string.
 * Scores are not money. The BFF normalizes the score for the browser.
 */
export const moderationCaseSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["idea", "campaign"]),
    ideaId: z.string().min(1).nullable(),
    campaignId: z.string().min(1).nullable(),
    submittedById: z.string().min(1).nullable(),
    decision: z.enum(["AUTO_CLEAR", "HELD_FOR_REVIEW"]),
    maxRisk: z.union([
      riskScore,
      z
        .string()
        .regex(/^(?:0(?:\.\d{1,4})?|1(?:\.0{1,4})?)$/)
        .transform(Number),
    ]),
    categories: z.array(
      z.object({
        code: policyCode,
        riskScore,
        excerpt: z.string().nullable(),
        draftReason: z.string(),
      }),
    ),
    reasonCodes: z.array(reasonCode),
    internalReason: z.string(),
    externalReason: z.string(),
    brief: z.string(),
    provider: z.string().trim().min(1),
    policyVersion: z.string().trim().min(1),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .refine(
    (record) =>
      record.decision === "AUTO_CLEAR"
        ? record.reasonCodes.length === 0
        : record.reasonCodes.length > 0,
    "The screening decision and reasons disagree.",
  );
export type ModerationCase = z.infer<typeof moderationCaseSchema>;
export const moderationReceiptSchema = z.object({
  mode: z.literal("live"),
  screening: moderationCaseSchema,
});

/** This endpoint screens supplied text under the admin, without a listing link. */
export function matchesScreening(
  record: ModerationCase,
  input: ScreenContent,
  actorId: string,
): boolean {
  return (
    record.kind === input.kind &&
    record.submittedById === actorId &&
    record.ideaId === null &&
    record.campaignId === null
  );
}
