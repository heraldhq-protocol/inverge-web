import "server-only";

import { z } from "zod";

import { previewAdminUsers } from "@/features/admin/content/preview-users";
import {
  ADMIN_USERS_PAGE_SIZE,
  adminUserSchema,
  updateUserRoleSchema,
  type AdminUser,
  type AdminUserRole,
  type AssignableAdminUserRole,
} from "@/features/admin/lib/users";
import type { AdminActor } from "@/features/admin/permissions";
import { readSessionToken } from "@/features/auth/server/session";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
  sendApiJson,
} from "@/lib/api/server";

export type AdminUsersRead =
  | { status: "denied" }
  | {
      status: "preview";
      actor: AdminActor;
      users: AdminUser[];
      hasMore: boolean;
    }
  | {
      status: "live";
      actor: AdminActor;
      users: AdminUser[];
      hasMore: boolean;
    }
  | { status: "unavailable"; reason: string };

export type AdminUsersQuery = {
  query?: string;
  role?: AdminUserRole | undefined;
  offset?: number;
  limit?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function matchesPreviewQuery(user: AdminUser, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    (user.email?.toLowerCase().includes(needle) ?? false) ||
    user.providerUserId.toLowerCase().includes(needle)
  );
}

/**
 * FR-901: gate the read itself, not only the navigation.
 *
 * The endpoint returns a bare array with no total, so `hasMore` is derived from
 * a full page rather than a count the API does not provide. A live failure never
 * borrows preview rows: an operator must never mistake sample accounts for real
 * ones.
 */
export async function listAdminUsers(
  input: AdminUsersQuery = {},
): Promise<AdminUsersRead> {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return { status: "denied" };

  const query = input.query?.trim().slice(0, 120) ?? "";
  const offset = clamp(Math.trunc(input.offset ?? 0) || 0, 0, 10_000);
  const limit = clamp(
    Math.trunc(input.limit ?? ADMIN_USERS_PAGE_SIZE) || ADMIN_USERS_PAGE_SIZE,
    1,
    200,
  );

  if (access.preview) {
    const filtered = previewAdminUsers.filter(
      (user) =>
        (!input.role || user.role === input.role) &&
        matchesPreviewQuery(user, query),
    );

    return {
      status: "preview",
      actor: access.actor,
      users: filtered.slice(offset, offset + limit),
      hasMore: filtered.length > offset + limit,
    };
  }

  const token = await readSessionToken();
  if (!token || !isApiConfigured()) {
    return {
      status: "unavailable",
      reason: !token
        ? "Your session could not be verified. Sign in again to manage access."
        : "The account service is not configured for this deployment.",
    };
  }

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (query) params.set("query", query);
  if (input.role) params.set("role", input.role);

  try {
    const payload = await fetchApiJson<unknown>(`/admin/users?${params}`);
    const parsed = z.array(adminUserSchema).safeParse(payload);
    if (!parsed.success) {
      return {
        status: "unavailable",
        reason:
          "The service returned an incomplete or invalid user list. Refresh to try again.",
      };
    }

    return {
      status: "live",
      actor: access.actor,
      users: parsed.data,
      hasMore: parsed.data.length === limit,
    };
  } catch (error) {
    const status = error instanceof ApiRequestError ? error.status : 0;
    return {
      status: "unavailable",
      reason:
        status === 401
          ? "Your session could not be verified. Sign in again to manage access."
          : status === 403
            ? "Your account does not have access to the user directory."
            : status === 404
              ? "User management is not enabled on the connected service."
              : "The user directory could not be loaded. Refresh to try again.",
    };
  }
}

export type AdminUserRoleWrite =
  | { ok: true; user: AdminUser }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
      details?: unknown;
    };

/**
 * One role change, attributed to the session token.
 *
 * The API audits the change and blocks self-demotion; this function only
 * validates that the response describes the account that changed, so a stale or
 * unrelated payload is reported rather than rendered as a new role.
 */
export async function submitAdminUserRole(
  id: string,
  role: AssignableAdminUserRole,
): Promise<AdminUserRoleWrite> {
  const request = updateUserRoleSchema.safeParse({ role });
  if (!request.success) {
    return {
      ok: false,
      status: 422,
      code: "VALIDATION_FAILED",
      message: "Only USER and ADMIN can be assigned by this endpoint.",
    };
  }
  const token = await readSessionToken();
  if (!token) {
    return {
      ok: false,
      status: 401,
      code: "NOT_SIGNED_IN",
      message: "Sign in again to change a role.",
    };
  }

  const result = await sendApiJson(
    `/admin/users/${encodeURIComponent(id)}/role`,
    {
      method: "PATCH",
      token,
      body: request.data,
    },
  );

  if (!result.ok) return result;

  const parsed = adminUserSchema.safeParse(result.data);
  if (!parsed.success || parsed.data.id !== id || parsed.data.role !== role) {
    return {
      ok: false,
      status: 502,
      code: "INVALID_RESPONSE",
      message:
        "The service did not confirm the role change. Refresh before trying again.",
    };
  }

  return { ok: true, user: parsed.data };
}
