import { NextResponse } from "next/server";

import { apiFailureResponse } from "@/lib/api/route";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { readSessionToken } from "@/features/auth/server/session";
import { assetIdFromMediaPath } from "@/features/media/lib/media-ref";
import { sendApiJson } from "@/lib/api/server";

type RouteContext = { params: Promise<{ assetId: string }> };

/**
 * Asks the API to verify uploaded bytes.
 *
 * This is the step that turns an upload into something attachable: the API reads
 * the object back, checks the size and magic bytes, and only then marks it ready.
 * That is why a retry here is meaningful - the bytes are already in storage, and
 * the verification is what may have failed.
 */
export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "ORIGIN_NOT_ALLOWED", message: "Cross-site uploads are not allowed." } },
      { status: 403 },
    );
  }

  if (isPreviewAuth()) {
    return NextResponse.json(
      {
        error: {
          code: "API_REQUIRED",
          message: "Preview sign-in has no backend account.",
        },
      },
      { status: 503 },
    );
  }

  const token = await readSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: { code: "NOT_SIGNED_IN", message: "Sign in before uploading an image." } },
      { status: 401 },
    );
  }

  const { assetId } = await context.params;
  // A well-formed id only: the path segment is forwarded into an API URL, so a
  // slash or a traversal attempt must not get that far.
  if (!assetIdFromMediaPath(`/api/media/${assetId}`)) {
    return NextResponse.json(
      { error: { code: "INVALID_ASSET", message: "That media reference is not valid." } },
      { status: 400 },
    );
  }

  const result = await sendApiJson(
    `/media/uploads/${encodeURIComponent(assetId)}/complete`,
    { method: "POST", token },
  );

  if (!result.ok) return apiFailureResponse(result);
  return NextResponse.json(result.data, { status: result.status });
}
