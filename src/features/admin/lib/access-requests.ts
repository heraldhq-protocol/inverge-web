import { z } from "zod";

export const accessRequestStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export type AccessRequestStatus = z.infer<typeof accessRequestStatusSchema>;
export type AccessRequestFilter = AccessRequestStatus | "ALL";

const instant = z.iso.datetime({ offset: true });

/** FR-901 / D-055: an access grant is separate from account role and tier. */
export const adminAccessRequestSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  email: z.string().nullable(),
  status: accessRequestStatusSchema,
  source: z.enum(["REQUEST", "ADMIN", "PAID"]),
  requestedAt: instant,
  decidedAt: instant.nullable(),
  expiresAt: instant.nullable(),
});
export type AdminAccessRequest = z.infer<typeof adminAccessRequestSchema>;

export const accessDecisionSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    expiresAt: instant.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.expiresAt && value.status !== "APPROVED") {
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Only an approval can have an expiry.",
      });
    } else if (value.expiresAt && Date.parse(value.expiresAt) <= Date.now()) {
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Choose an expiry in the future.",
      });
    }
  });
export type AccessDecision = z.infer<typeof accessDecisionSchema>;

export const accessDecisionReceiptSchema = z.object({
  mode: z.literal("live"),
  request: adminAccessRequestSchema,
});

export const ACCESS_FILTERS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All requests" },
] as const;

export function accessFilter(value: unknown): AccessRequestFilter {
  if (value === "ALL") return value;
  const parsed = accessRequestStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : "PENDING";
}

/** A successful HTTP status alone cannot confirm an authorization change. */
export function matchesAccessDecision(
  receipt: AdminAccessRequest,
  id: string,
  decision: AccessDecision,
): boolean {
  return (
    receipt.id === id &&
    receipt.status === decision.status &&
    receipt.decidedAt !== null &&
    (decision.expiresAt
      ? receipt.expiresAt !== null &&
        Date.parse(receipt.expiresAt) === Date.parse(decision.expiresAt)
      : receipt.expiresAt === null)
  );
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export function formatAccessDate(value: string): string {
  return dateFormat.format(new Date(value));
}

export function accessStatusLabel(
  request: AdminAccessRequest,
  asOf: string,
): string {
  if (
    request.status === "APPROVED" &&
    request.expiresAt &&
    Date.parse(request.expiresAt) <= Date.parse(asOf)
  )
    return "Expired approval";
  return { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" }[
    request.status
  ];
}
