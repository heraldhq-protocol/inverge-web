import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { updateUserRoleSchema } from "@/features/admin/lib/users";
import { submitAdminUserRole } from "@/features/admin/server/users";
import { isSameOriginRequest } from "@/features/auth/server/origin";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  apiFailureResponse,
  invalidJsonBodyResponse,
  previewAuthResponse,
} from "@/lib/api/route";

/**
 * FR-901: the session and the admin role are rechecked at the mutation boundary.
 * Preview authentication has no backend account, so it never reaches the API.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return apiFailureResponse({
      ok: false,
      status: 403,
      code: "ORIGIN_NOT_ALLOWED",
      message: "Cross-site request refused.",
    });
  }

  const access = await getProgrammeAdminAccess();
  if (!access.allowed) {
    return apiFailureResponse({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: access.reason,
    });
  }

  if (access.preview) return previewAuthResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidJsonBodyResponse();
  }

  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return apiFailureResponse({
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message: "Choose a role this deployment can assign.",
    });
  }

  const { id } = await context.params;

  // The API enforces this too; rejecting here keeps the operator's session from
  // locking itself out even if that guard ever regresses.
  if (id === access.actor.id && parsed.data.role !== "ADMIN") {
    return apiFailureResponse({
      ok: false,
      status: 400,
      code: "SELF_DEMOTION",
      message: "You cannot remove your own admin access.",
    });
  }

  const result = await submitAdminUserRole(id, parsed.data.role);
  if (!result.ok) return apiFailureResponse(result);

  revalidatePath("/admin/users");
  return NextResponse.json(result.user);
}
