import { z } from "zod";

export const AML_SCREEN_TIMEOUT_MS = 30_000;
/** The history endpoint returns at most 100 screenings and no total. */
export const AML_HISTORY_MAX_ITEMS = 100;

export const AML_KINDS = ["individual", "business"] as const;
export type AmlKind = (typeof AML_KINDS)[number];

export function isAmlKind(value: unknown): value is AmlKind {
  return (
    typeof value === "string" &&
    (AML_KINDS as readonly string[]).includes(value)
  );
}

export const AML_KIND_LABELS: Record<AmlKind, string> = {
  individual: "Individual",
  business: "Business",
};

/**
 * The request follows `AmlScreenDto`. `entityType` is deliberately omitted:
 * the individual endpoint defaults it to `person` and the business endpoint
 * forces `company`, so the endpoint path is the authority.
 */
export const amlScreenSchema = z
  .object({
    kind: z.enum(AML_KINDS),
    userId: z
      .string()
      .trim()
      .min(1, "Enter the account to screen.")
      .max(200, "Keep the account id within 200 characters."),
    fullName: z
      .string()
      .trim()
      .min(1, "Enter the subject's full name.")
      .max(200, "Keep the full name within 200 characters."),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format.")
      .optional(),
    documentNumber: z
      .string()
      .trim()
      .min(1, "Enter the document number.")
      .max(100, "Keep the document number within 100 characters.")
      .optional(),
    nationality: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2,3}$/, "Use an ISO country code (alpha-2 or alpha-3).")
      .optional(),
  })
  .strict();
export type AmlScreenInput = z.infer<typeof amlScreenSchema>;

export const AML_STATUSES = ["CLEAR", "IN_REVIEW", "FLAGGED"] as const;
export type AmlStatus = (typeof AML_STATUSES)[number];

export const AML_STATUS_LABELS: Record<AmlStatus, string> = {
  CLEAR: "No matches found",
  IN_REVIEW: "Needs review",
  FLAGGED: "Possible match — review required",
};

export type AmlPillTone = "accent" | "warning" | "danger";

export const AML_STATUS_TONES: Record<AmlStatus, AmlPillTone> = {
  CLEAR: "accent",
  IN_REVIEW: "warning",
  FLAGGED: "danger",
};

/**
 * The OpenAPI response is unspecified. This follows the screening return in
 * `KycService` at API main: `{ datasets, topRiskScore, totalHits, status }`.
 * The response does not echo the subject, so no field here can confirm who was
 * screened — the caller keeps that pairing. A decimal score may arrive as a
 * numeric string; scores are review signals, not money.
 */
const riskScore = z.union([
  z.number().min(0),
  z
    .string()
    .regex(/^\d+(?:\.\d+)?$/)
    .transform(Number),
]);

export const amlScreeningResultSchema = z.object({
  datasets: z.array(z.string().min(1)).max(50),
  topRiskScore: riskScore.nullable(),
  totalHits: z.number().int().min(0),
  status: z.enum(AML_STATUSES),
});
export type AmlScreeningResult = z.infer<typeof amlScreeningResultSchema>;

export const amlScreeningRecordSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["KYC_SESSION", "STANDALONE"]),
  status: z.enum(AML_STATUSES),
  topRiskScore: riskScore.nullable(),
  totalHits: z.number().int().min(0),
  datasets: z.array(z.string().min(1)).max(50),
  createdAt: z.iso.datetime({ offset: true }),
});
export type AmlScreeningRecord = z.infer<typeof amlScreeningRecordSchema>;

export const amlReceiptSchema = z.object({
  mode: z.literal("live"),
  kind: z.enum(AML_KINDS),
  userId: z.string().min(1),
  result: amlScreeningResultSchema,
});
export type AmlReceipt = z.infer<typeof amlReceiptSchema>;

/** The response does not echo the subject, so the BFF carries it back. */
export function matchesAmlScreening(
  receipt: AmlReceipt,
  input: AmlScreenInput,
): boolean {
  return receipt.kind === input.kind && receipt.userId === input.userId;
}

export const AML_SOURCE_LABELS: Record<AmlScreeningRecord["source"], string> = {
  KYC_SESSION: "Verification run",
  STANDALONE: "Admin screening",
};

/** The individual endpoint defaults `entityType` to `person`. */
export function amlScreenEndpoint(kind: AmlKind): string {
  return kind === "business"
    ? "/kyb/admin/aml-screen"
    : "/kyc/admin/aml-screen";
}

export function amlHistoryEndpoint(kind: AmlKind, userId: string): string {
  return `/${kind === "business" ? "kyb" : "kyc"}/admin/aml/${encodeURIComponent(userId)}`;
}
