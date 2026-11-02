import { NextResponse } from "next/server";
import { z } from "zod";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { requireApiToken } from "@/features/auth/server/api-token";
import {
  apiFailureResponse,
  invalidBodyResponse,
  previewModeResponse,
} from "@/features/settings/server/bff";
import { sendApiJson } from "@/lib/api/server";

const profileSchema = z
  .object({
    avatarUrl: z.string().trim().min(1).max(2048).optional(),
    bio: z.string().trim().max(280).optional(),
    displayName: z.string().trim().min(1).max(50).optional(),
    location: z.string().trim().max(80).optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_-]+$/)
      .transform((value) => value.toLowerCase())
      .optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "At least one profile field is required.",
  });

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }
  if (isPreviewAuth()) return previewModeResponse();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidBodyResponse();
  }

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) return invalidBodyResponse();

  const token = await requireApiToken("Sign in again to save your profile.");
  if (!token.ok) {
    return NextResponse.json(
      { error: { code: token.code, message: token.message } },
      { status: token.status },
    );
  }

  const result = await sendApiJson("/auth/me/profile", {
    body: parsed.data,
    method: "PATCH",
    token: token.token,
  });
  if (!result.ok) {
    if (result.status === 400 && /username/i.test(result.message)) {
      return NextResponse.json(
        {
          error: {
            code: "USERNAME_TAKEN",
            message: "That username is already taken.",
          },
        },
        { status: 409 },
      );
    }
    return apiFailureResponse(result);
  }

  return NextResponse.json({ saved: true });
}
