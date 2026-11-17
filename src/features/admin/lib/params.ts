import { z } from "zod";

export const platformParamValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
export type PlatformParamValue = z.infer<typeof platformParamValueSchema>;

export const platformParamsSchema = z.record(
  z.string(),
  platformParamValueSchema,
);
export type PlatformParams = z.infer<typeof platformParamsSchema>;

export const updateParamsSchema = z.object({
  params: z
    .record(z.string().min(1, "Key cannot be empty"), platformParamValueSchema)
    .refine(
      (obj) => Object.keys(obj).length > 0,
      "Provide at least one parameter to update",
    ),
});
export type UpdateParamsPayload = z.infer<typeof updateParamsSchema>;

export const paramAuditEntrySchema = z.object({
  id: z.string().optional(),
  key: z.string(),
  // Stored values are Prisma JSON: primitives today, but the audit reader must
  // not fail closed on a structured value the API already accepted.
  oldValue: z.unknown().optional(),
  newValue: z.unknown().optional(),
  // The API records the acting account id as `changedBy`.
  changedBy: z.string().optional().nullable(),
  // Legacy/knowledge fixtures may carry a display actor instead.
  actorId: z.string().optional().nullable(),
  actorName: z.string().optional().nullable(),
  changedAt: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});
export type ParamAuditEntry = z.infer<typeof paramAuditEntrySchema>;

/** Render a stored parameter value without losing structure. */
export function formatParamValue(value: unknown): string {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export const paramAuditListSchema = z.union([
  z.array(paramAuditEntrySchema),
  z
    .object({
      items: z.array(paramAuditEntrySchema),
      total: z.number().optional(),
    })
    .transform((val) => val.items),
]);

export const paramAuditQuerySchema = z.object({
  key: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ParamAuditQuery = z.infer<typeof paramAuditQuerySchema>;

export const previewPlatformParams: PlatformParams = {
  "boost.basic.priceUSD": 50,
  "boost.basic.durationDays": 7,
  "boost.featured.priceUSD": 150,
  "boost.featured.durationDays": 14,
  "validation.minSupporters": 25,
  "validation.fundingThresholdUSD": 1000,
  "editorial.emails.enabled": true,
  "platform.successFeeBps": 500,
};

export const previewParamAuditEntries: ParamAuditEntry[] = [
  {
    id: "audit-1",
    key: "boost.featured.priceUSD",
    oldValue: 120,
    newValue: 150,
    changedBy: "usr_admin_1",
    changedAt: "2026-11-01T12:00:00.000Z",
  },
  {
    id: "audit-2",
    key: "editorial.emails.enabled",
    oldValue: false,
    newValue: true,
    changedBy: "usr_admin_1",
    changedAt: "2026-10-28T09:30:00.000Z",
  },
  {
    id: "audit-3",
    key: "validation.minSupporters",
    oldValue: 20,
    newValue: 25,
    changedBy: "usr_admin_2",
    changedAt: "2026-10-15T15:20:00.000Z",
  },
];
