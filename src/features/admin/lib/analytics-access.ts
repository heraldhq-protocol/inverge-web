import { z } from "zod";

import {
  accessFilter,
  adminAccessRequestSchema,
  type AccessRequestFilter,
} from "@/features/admin/lib/access-requests";

export const adminAnalyticsAccessRequestSchema =
  adminAccessRequestSchema.extend({
    displayName: z.string().nullable(),
    username: z.string().nullable(),
    creatorTier: z.enum(["STARTER", "TRUSTED", "ESTABLISHED"]),
  });
export type AdminAnalyticsAccessRequest = z.infer<
  typeof adminAnalyticsAccessRequestSchema
>;

/** The documented cursor contract, including an explicitly omitted total. */
export const analyticsAccessListSchema = z
  .object({
    data: z.array(adminAnalyticsAccessRequestSchema).max(50),
    page: z.object({
      limit: z.number().int().min(1).max(50),
      nextCursor: z.string().min(1).max(2048).nullable(),
      hasMore: z.boolean(),
      total: z.number().int().nonnegative().nullable(),
      totalKind: z.enum(["exact", "estimated", "omitted"]),
    }),
  })
  .refine(
    ({ data, page }) =>
      data.length <= page.limit &&
      (page.hasMore
        ? page.nextCursor !== null && data.length > 0
        : page.nextCursor === null) &&
      (page.totalKind === "omitted"
        ? page.total === null
        : page.total !== null),
  );
export type AnalyticsAccessList = z.infer<typeof analyticsAccessListSchema>;
export type AnalyticsAccessQuery = {
  status: AccessRequestFilter;
  limit: number;
  cursor?: string;
};

export function parseAnalyticsAccessQuery(
  params: Record<string, string | string[] | undefined>,
): AnalyticsAccessQuery {
  return {
    status: accessFilter(params.status),
    limit: params.limit === "50" ? 50 : 24,
    ...(typeof params.cursor === "string" && params.cursor
      ? { cursor: params.cursor }
      : {}),
  };
}

export function analyticsAccessHref(query: AnalyticsAccessQuery): string {
  const params = new URLSearchParams({ status: query.status });
  if (query.limit !== 24) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);
  return `/admin/analytics-access?${params}`;
}
