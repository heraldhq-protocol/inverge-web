import { NextResponse } from "next/server";

import { requireApiToken } from "@/features/auth/server/api-token";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { sendApiJson } from "@/lib/api/server";
import {
  apiFailureResponse,
  invalidJsonBodyResponse,
  previewAuthResponse,
} from "@/lib/api/route";

const SLUG = /^[a-z0-9][a-z0-9-]{0,80}$/i;
const ENTRY_ID = /^[a-z0-9_-]{1,64}$/i;

type RouteContext = { params: Promise<{ segments: string[] }> };

/**
 * The participant write boundary.
 *
 * Every mutation the workspace performs goes through this single allowlist.
 * That keeps the session cookie server-side and prevents the browser from
 * turning the BFF into an open proxy for arbitrary API routes. Only paths the
 * participant UI needs are forwarded.
 */
function apiPath(segments: string[]): string | null {
  if (segments.length === 1 && segments[0] === "mine") {
    return "/programmes/mine";
  }

  const [slug, ...rest] = segments;
  if (!slug || !SLUG.test(slug)) return null;

  const [first, second, third] = rest;
  if (rest.length === 1 && first === "register") {
    return `/programmes/${slug}/register`;
  }
  if (rest.length === 1 && first === "entries") {
    return `/programmes/${slug}/entries`;
  }
  if (rest.length === 2 && first === "entries") {
    if (!second || !ENTRY_ID.test(second)) return null;
    return `/programmes/${slug}/entries/${second}`;
  }
  if (rest.length === 3 && first === "entries") {
    if (!second || !ENTRY_ID.test(second)) return null;
    if (third !== "submit" && third !== "withdraw") return null;
    return `/programmes/${slug}/entries/${second}/${third}`;
  }

  return null;
}

async function handle(
  request: Request,
  context: RouteContext,
  method: "GET" | "PATCH" | "POST",
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      {
        error: {
          code: "ORIGIN_NOT_ALLOWED",
          message: "Cross-origin request refused.",
        },
      },
      { status: 403 },
    );
  }

  if (isPreviewAuth()) return previewAuthResponse();

  const auth = await requireApiToken("Sign in before managing your entries.");
  if (!auth.ok) return apiFailureResponse(auth);

  const { segments } = await context.params;
  const path = apiPath(segments);
  if (!path) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "This participant action does not exist.",
        },
      },
      { status: 404 },
    );
  }
  if (method === "GET" && path !== "/programmes/mine") {
    return NextResponse.json(
      {
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "This participant action does not accept a read.",
        },
      },
      { status: 405 },
    );
  }

  let body: unknown;
  if (method !== "GET") {
    try {
      body = await request.json();
    } catch {
      return invalidJsonBodyResponse();
    }
  }

  const result = await sendApiJson(path, {
    method,
    token: auth.token,
    ...(body === undefined ? {} : { body }),
  });

  if (!result.ok) return apiFailureResponse(result);
  return NextResponse.json(result.data, { status: result.status });
}

export function GET(request: Request, context: RouteContext) {
  return handle(request, context, "GET");
}

export function POST(request: Request, context: RouteContext) {
  return handle(request, context, "POST");
}

export function PATCH(request: Request, context: RouteContext) {
  return handle(request, context, "PATCH");
}
