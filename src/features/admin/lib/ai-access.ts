import { z } from "zod";

import {
  accessFilter,
  adminAccessRequestSchema,
  type AccessRequestFilter,
} from "@/features/admin/lib/access-requests";

/** Response projection: AiEntitlementService at backend revision c3e23b0. */
export const aiAccessListSchema = z.object({
  data: z.array(adminAccessRequestSchema).max(200),
});

export type AiAccessQuery = { status: AccessRequestFilter; limit: number };

export function parseAiAccessQuery(
  params: Record<string, string | string[] | undefined>,
): AiAccessQuery {
  const limit = typeof params.limit === "string" ? Number(params.limit) : 50;
  return {
    status: accessFilter(params.status),
    limit: [50, 100, 200].includes(limit) ? limit : 50,
  };
}

export function aiAccessHref(query: AiAccessQuery): string {
  const params = new URLSearchParams({ status: query.status });
  if (query.limit !== 50) params.set("limit", String(query.limit));
  return `/admin/ai-access?${params}`;
}
