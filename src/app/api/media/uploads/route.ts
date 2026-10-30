import { NextResponse } from "next/server";
import { z } from "zod";

import { apiFailureResponse, invalidJsonBodyResponse } from "@/lib/api/route";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { readSessionToken } from "@/features/auth/server/session";
import { sendApiJson } from "@/lib/api/server";

/**
 * Requests an upload target for one image.
 *
 * The browser never sees the storage credential and never names the object key:
 * it sends what it intends to upload and receives a short-lived target. A caller
 * that is not signed in gets a 401 before anything reaches the API, and a
 * cross-site request is refused because this endpoint changes state.
 */

const uploadSchema = z.object({
  contentType: z.string().trim().min(1).max(120),
  byteSize: z.number().int().positive().max(200 * 1024 * 1024),
  category: z
    .enum([
      "AVATAR",
      "IDEA_COVER",
      "IDEA_GALLERY",
      "CAMPAIGN_COVER",
      "CAMPAIGN_HERO",
      "CAMPAIGN_STORY",
      "REWARD",
      "OTHER",
    ])
    .optional(),
  displayName: z.string().trim().max(255).optional(),
  altText: z.string().trim().max(280).optional(),
  caption: z.string().trim().max(280).optional(),
});

export async function POST(request: Request) {
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
          message:
            "Preview sign-in has no backend account. Sign in with the API to upload media.",
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }

  const parsed = uploadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "The upload request is not valid." } },
      { status: 400 },
    );
  }

  const result = await sendApiJson("/media/uploads", {
    body: parsed.data,
    method: "POST",
    token,
  });

  if (!result.ok) return apiFailureResponse(result);
  return NextResponse.json(result.data, { status: result.status });
}
