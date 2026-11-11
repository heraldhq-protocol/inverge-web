import { z } from "zod";

// FR-304. OpenAPI defines requests; response projections follow the backend
// CampaignReviewService at the revision recorded in docs/ADMIN_WORKSPACE.md.
const id = z.string().min(1);
const timestamp = z.iso.datetime({ offset: true });
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const decimal = z
  .string()
  .max(100)
  .regex(/^\d+(?:\.\d{1,2})?$/);
const percentage = z
  .union([decimal, z.number().min(0).max(100)])
  .refine((value) => Number(value) <= 100);

export const reviewStatusSchema = z.enum([
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "NOT_SUBMITTED",
]);
export const reviewFilterSchema = z.enum([
  ...reviewStatusSchema.options,
  "ALL",
]);
export const reviewActionSchema = z.enum([
  "APPROVE",
  "REQUEST_CHANGES",
  "REJECT",
]);
export type ReviewAction = z.infer<typeof reviewActionSchema>;
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

export const reviewLabels: Record<ReviewStatus | "ALL", string> = {
  IN_REVIEW: "Awaiting review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NOT_SUBMITTED: "Not submitted",
  ALL: "All campaigns",
};
export const reviewActionLabels: Record<ReviewAction, string> = {
  APPROVE: "Approve campaign",
  REQUEST_CHANGES: "Request changes",
  REJECT: "Reject campaign",
};
export const nextReviewStatus = {
  APPROVE: "APPROVED",
  REQUEST_CHANGES: "CHANGES_REQUESTED",
  REJECT: "REJECTED",
} as const;

export const reviewRequestSchema = z
  .object({
    action: reviewActionSchema,
    reason: z
      .string()
      .trim()
      .max(2000, "Keep the reason to 2,000 characters or fewer.")
      .optional(),
  })
  .refine(
    (value) => value.action === "APPROVE" || (value.reason?.length ?? 0) >= 20,
    {
      path: ["reason"],
      message: "Give the creator a reason of at least 20 characters.",
    },
  );
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

const creatorSchema = z.object({
  id,
  email: z.string().nullable(),
  creatorProfile: z
    .object({
      displayName: z.string().nullable(),
      username: z.string().nullable(),
    })
    .nullable(),
  business: z.object({ legalName: z.string() }).nullable(),
});

export const adminCampaignRowSchema = z.object({
  id,
  type: z.enum(["ALL_OR_NOTHING", "FLEXIBLE_FUNDING"]),
  status: z.enum([
    "DRAFT",
    "IN_REVIEW",
    "ACTIVE",
    "FUNDED",
    "FAILED",
    "COMPLETED",
  ]),
  reviewStatus: reviewStatusSchema,
  targetAmount: decimal.nullable(),
  deadline: timestamp.nullable(),
  submittedAt: timestamp.nullable(),
  reviewedAt: timestamp.nullable(),
  reviewReason: z.string().nullable(),
  creator: creatorSchema,
  idea: z
    .object({
      id,
      title: z.string(),
      category: z.string().nullable(),
      region: z.string().nullable(),
    })
    .nullable(),
  _count: z.object({ milestones: count }),
});
export type AdminCampaignRow = z.infer<typeof adminCampaignRowSchema>;
export const adminCampaignQueueSchema = z
  .object({
    items: z.array(adminCampaignRowSchema).max(100),
    total: count,
    skip: count,
    take: z.number().int().min(1).max(100),
    reviewStatus: reviewFilterSchema,
  })
  .refine(
    (value) =>
      value.items.length <= value.take &&
      value.items.length <= value.total &&
      new Set(value.items.map((row) => row.id)).size === value.items.length &&
      value.items.every(
        (row) =>
          value.reviewStatus === "ALL" ||
          row.reviewStatus === value.reviewStatus,
      ),
  );
export type AdminCampaignQueue = z.infer<typeof adminCampaignQueueSchema>;

const reviewEventSchema = z
  .object({
    id,
    action: reviewActionSchema,
    fromStatus: z.literal("IN_REVIEW"),
    toStatus: reviewStatusSchema,
    reason: z.string().nullable(),
    createdAt: timestamp,
    actor: z.object({ id, email: z.string().nullable(), role: z.string() }),
  })
  .refine((event) => event.toStatus === nextReviewStatus[event.action]);

export const adminCampaignDetailSchema = z.object({
  campaign: adminCampaignRowSchema.extend({
    tokenType: z.string().min(1),
    fundingFloorPct: z.number().min(0).max(100).nullable(),
    workingCapitalPct: percentage,
    termsHash: z.string().nullable(),
    videoUrl: z.string().nullable(),
    videoPosterUrl: z.string().nullable(),
    coverImageUrl: z.string().nullable(),
    rewardTiers: z.json().nullable(),
    ideaSnapshot: z.json().nullable(),
    launchedAt: timestamp.nullable(),
    milestones: z.array(
      z.object({
        id,
        index: count,
        title: z.string(),
        deliverable: z.string(),
        tranchePct: percentage,
        evidenceDefinition: z.json(),
      }),
    ),
  }),
  // Fee amount is deliberately not projected: the backend currently converts
  // its Decimal to Number. Approval uses the server's fee check, not arithmetic.
  applicationFee: z
    .object({
      id,
      purpose: z.string(),
      status: z.string(),
      currency: z.string(),
      createdAt: timestamp,
    })
    .nullable(),
  preconditions: z
    .object({
      eligible: z.boolean(),
      code: z.string().nullable(),
      blockers: z.array(z.string()),
      checks: z
        .array(
          z.object({
            key: z.enum(["identity", "application_fee"]),
            label: z.string(),
            satisfied: z.boolean(),
            detail: z.string(),
          }),
        )
        .length(2)
        .refine(
          (checks) => new Set(checks.map((check) => check.key)).size === 2,
        ),
    })
    .refine(
      (value) =>
        !value.eligible ||
        (value.blockers.length === 0 &&
          value.checks.every((check) => check.satisfied)),
    ),
  reviewEvents: z.array(reviewEventSchema),
});
export type AdminCampaignDetail = z.infer<typeof adminCampaignDetailSchema>;

export const campaignReviewDecisionSchema = z
  .object({
    id,
    reviewStatus: reviewStatusSchema,
    reviewedAt: timestamp,
    reviewedById: id,
    reviewReason: z.string().nullable(),
    event: reviewEventSchema,
  })
  .refine(
    (value) =>
      value.reviewStatus === value.event.toStatus &&
      value.reviewedById === value.event.actor.id &&
      value.reviewedAt === value.event.createdAt &&
      value.reviewReason === value.event.reason,
  );
export type CampaignReviewDecision = z.infer<
  typeof campaignReviewDecisionSchema
>;
export const reviewSuccessSchema = z.object({
  mode: z.literal("live"),
  decision: campaignReviewDecisionSchema,
});

export type ReviewQuery = {
  reviewStatus: z.infer<typeof reviewFilterSchema>;
  skip: number;
  take: number;
};
export function reviewQuery(params: {
  [key: string]: string | string[] | undefined;
}): ReviewQuery {
  const status = reviewFilterSchema.safeParse(params.reviewStatus);
  const skip =
    typeof params.skip === "string" && /^\d+$/.test(params.skip)
      ? Number(params.skip)
      : 0;
  return {
    reviewStatus: status.success ? status.data : "IN_REVIEW",
    skip: Number.isSafeInteger(skip) ? skip : 0,
    take: 50,
  };
}
export function reviewQueueHref(query: ReviewQuery): string {
  return `/admin/campaigns?${new URLSearchParams({ reviewStatus: query.reviewStatus, skip: String(query.skip) })}`;
}
export function adminCampaignTitle(campaign: AdminCampaignRow): string {
  return campaign.idea?.title.trim() || `Campaign ${campaign.id}`;
}
export function adminCreatorName(campaign: AdminCampaignRow): string {
  return (
    campaign.creator.creatorProfile?.displayName ||
    campaign.creator.business?.legalName ||
    campaign.creator.creatorProfile?.username ||
    campaign.creator.email ||
    campaign.creator.id
  );
}
export function reviewDate(value: string | null): string {
  return value === null
    ? "Not provided"
    : `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC`;
}
export function reviewUsd(value: string | null): string {
  if (value === null) return "Not provided";
  const [whole = "0", fraction = ""] = decimal.parse(value).split(".");
  return `$${BigInt(whole).toLocaleString("en-US")}.${fraction.padEnd(2, "0")}`;
}
