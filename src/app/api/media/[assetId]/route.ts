import { NextResponse } from "next/server";
import { z } from "zod";

import {
  apiFailureResponse,
  invalidJsonBodyResponse,
} from "@/lib/api/route";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { readSessionToken } from "@/features/auth/server/session";
import { assetIdFromMediaPath } from "@/features/media/lib/media-ref";
import { ApiRequestError, fetchApiJson, sendApiJson } from "@/lib/api/server";

type RouteContext = { params: Promise<{ assetId: string }> };

type ReadUrlPayload = { url: string; expiresAt: string; public?: boolean };

const updateSchema = z.object({
  altText: z.string().max(280).optional(),
  caption: z.string().max(280).optional(),
  displayName: z.string().trim().min(1).max(255).optional(),
});

function invalidAsset() {
  return NextResponse.json(
    { error: { code: "INVALID_ASSET", message: "That media reference is not valid." } },
    { status: 400 },
  );
}

/**
 * The one public read path for stored media.
 *
 * The bucket is private, so this route asks the API whether the viewer may see
 * the asset (owner, or bound to published content) and redirects to a
 * short-lived signed URL. Nothing about the provider reaches the page, and a
 * draft's asset is a 404 to anybody else.
 *
 * The redirect is cached only when the API says the asset is publicly readable.
 * A private one is `no-store`, so a shared proxy cannot replay an owner's signed
 * URL to the next request.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { assetId } = await context.params;
  if (!assetIdFromMediaPath(`/api/media/${assetId}`)) return invalidAsset();

  const token = isPreviewAuth() ? null : await readSessionToken();

  let payload: ReadUrlPayload;
  try {
    payload = await fetchApiJson<ReadUrlPayload>(
      `/media/${encodeURIComponent(assetId)}/url`,
      { token },
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return new NextResponse(null, { status: 404 });
    }
    return new NextResponse(null, { status: 503 });
  }

  if (!payload?.url) return new NextResponse(null, { status: 502 });

  return NextResponse.redirect(payload.url, {
    status: 302,
    headers: {
      "Cache-Control": payload.public
        ? "public, max-age=60, stale-while-revalidate=30"
        : "private, no-store",
    },
  });
}

/** Display metadata only (alt text, caption, filename). Never the object. */
export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED", message: "Cross-site changes are not allowed." } },
      { status: 403 },
    );
  }

  const { assetId } = await context.params;
  if (!assetIdFromMediaPath(`/api/media/${assetId}`)) return invalidAsset();

  if (isPreviewAuth()) {
    return NextResponse.json(
      { error: { code: "API_REQUIRED", message: "Preview sign-in has no backend account." } },
      { status: 503 },
    );
  }

  const token = await readSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: { code: "NOT_SIGNED_IN", message: "Sign in to change media." } },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "That media update is not valid." } },
      { status: 400 },
    );
  }

  const result = await sendApiJson(`/media/${encodeURIComponent(assetId)}`, {
    body: parsed.data,
    method: "PATCH",
    token,
  });
  if (!result.ok) return apiFailureResponse(result);
  return NextResponse.json(result.data, { status: result.status });
}

/** Idempotent delete: a repeated request is a success, not an error. */
export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED", message: "Cross-site changes are not allowed." } },
      { status: 403 },
    );
  }

  const { assetId } = await context.params;
  if (!assetIdFromMediaPath(`/api/media/${assetId}`)) return invalidAsset();

  if (isPreviewAuth()) {
    return NextResponse.json(
      { error: { code: "API_REQUIRED", message: "Preview sign-in has no backend account." } },
      { status: 503 },
    );
  }

  const token = await readSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: { code: "NOT_SIGNED_IN", message: "Sign in to remove media." } },
      { status: 401 },
    );
  }

  const result = await sendApiJson(`/media/${encodeURIComponent(assetId)}`, {
    method: "DELETE",
    token,
  });
  if (!result.ok) return apiFailureResponse(result);
  return NextResponse.json(result.data, { status: result.status });
}
