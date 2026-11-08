import { z } from "zod";

import type { SearchPayload } from "@/features/search/types";

const hitSchema = z.object({
  href: z.string().min(1),
  id: z.string().min(1),
  isOwn: z.boolean(),
  kind: z.enum(["idea", "campaign"]),
  status: z.string().nullable(),
  statusLabel: z.string().nullable(),
  subtitle: z.string(),
  title: z.string(),
});

const payloadSchema = z.object({
  campaigns: z.array(hitSchema),
  ideas: z.array(hitSchema),
  meta: z.object({
    ownIncluded: z.boolean(),
    query: z.string(),
  }),
});

export class SearchRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "SearchRequestError";
    this.status = status;
    this.code = code;
  }
}

type ErrorEnvelope = {
  error?: { code?: unknown; message?: unknown };
};

/**
 * One palette search against the BFF. The caller owns cancellation and
 * stale-response sequencing; this function only turns a non-2xx response into a
 * typed error and validates the shape before the UI trusts it.
 */
export async function requestSearch(
  query: string,
  options: { includeOwn: boolean; signal?: AbortSignal },
): Promise<SearchPayload> {
  const params = new URLSearchParams({ q: query });
  if (options.includeOwn) params.set("own", "1");

  const response = await fetch(`/api/search?${params.toString()}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: options.signal ?? null,
  });

  if (!response.ok) {
    let body: ErrorEnvelope | null = null;
    try {
      body = (await response.json()) as ErrorEnvelope;
    } catch {
      body = null;
    }
    const message =
      typeof body?.error?.message === "string" && body.error.message.trim()
        ? body.error.message
        : "Search is unavailable right now.";
    const code =
      typeof body?.error?.code === "string" && body.error.code.trim()
        ? body.error.code
        : "SEARCH_FAILED";
    throw new SearchRequestError(message, response.status, code);
  }

  const parsed = payloadSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new SearchRequestError(
      "Search returned an unexpected response.",
      502,
      "SEARCH_INVALID_RESPONSE",
    );
  }

  return parsed.data;
}
