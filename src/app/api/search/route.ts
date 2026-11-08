import { NextResponse } from "next/server";
import { z } from "zod";

import { readSessionToken } from "@/features/auth/server/session";
import { searchContent } from "@/features/search/server/search-api";
import { createRateLimiter } from "@/lib/api/rate-limit";
import { isApiConfigured } from "@/lib/api/server";

const querySchema = z.string().trim().min(1).max(100);

const limiter = createRateLimiter(40, 10_000);

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return (
    first ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "anonymous"
  );
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: { "cache-control": "no-store", ...headers },
    },
  );
}

/**
 * Content search for the command palette.
 *
 * The browser sends only a query and an "include my content" flag. The session
 * token is read from the HttpOnly cookie here, so `mine=true` is never a client
 * authorisation decision, and the API remains authoritative about what the
 * caller may read. Responses are never cached: a creator's draft in one session
 * must not be served to the next.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(url.searchParams.get("q") ?? "");

  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_SEARCH_QUERY",
      "Search needs between 1 and 100 characters.",
    );
  }

  const limited = limiter.check(clientKey(request));
  if (!limited.allowed) {
    return errorResponse(
      429,
      "SEARCH_RATE_LIMITED",
      "Too many searches. Try again in a moment.",
      { "retry-after": String(limited.retryAfterSeconds) },
    );
  }

  if (!isApiConfigured()) {
    return errorResponse(
      503,
      "API_NOT_CONFIGURED",
      "Search is not connected on this deployment.",
    );
  }

  const includeOwn = url.searchParams.get("own") === "1";
  const token = includeOwn ? await readSessionToken() : null;

  try {
    const payload = await searchContent({
      includeOwn: Boolean(token),
      query: parsed.data,
      token,
    });

    return NextResponse.json(payload, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("[search] request failed", error);
    return errorResponse(
      503,
      "SEARCH_UNAVAILABLE",
      "Search is unavailable right now.",
      { "retry-after": "5" },
    );
  }
}
