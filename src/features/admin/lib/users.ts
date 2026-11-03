import { z } from "zod";

import type { PillTone } from "@/components/ui/pill";

/**
 * Platform access roles, as the API stores them.
 *
 * This is the API's `UserRole` enum, not the web app's `AdminRole` union: the
 * directory manages accounts, so it must speak the vocabulary the API writes.
 * `COMPLIANCE_REVIEWER` exists in the database and is displayed, but
 * `UpdateUserRoleDto` still accepts only `USER` and `ADMIN`; see
 * `ASSIGNABLE_ROLES` before offering it as a choice.
 */
export const adminUserRoleSchema = z.enum([
  "USER",
  "COMPLIANCE_REVIEWER",
  "ADMIN",
]);

export type AdminUserRole = z.infer<typeof adminUserRoleSchema>;

/** The API's `KycStatus` enum. */
export const adminKycStatusSchema = z.enum([
  "NOT_REQUIRED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

export type AdminKycStatus = z.infer<typeof adminKycStatusSchema>;

/**
 * The admin projection returned by `GET /admin/users`.
 *
 * The endpoint selects `id`, `email`, `providerUserId`, `role`, `kycStatus`,
 * `bannedAt` and `createdAt` only. It never returns KYC references, wallets or
 * provider subjects beyond the opaque account id, so nothing here is secret.
 */
export const adminUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().nullable(),
  providerUserId: z.string().min(1),
  role: adminUserRoleSchema,
  kycStatus: adminKycStatusSchema,
  bannedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

/** One API page. The endpoint takes `limit`/`offset` and returns no total. */
export const ADMIN_USERS_PAGE_SIZE = 25;

/**
 * Roles this UI can assign today. The API also stores `COMPLIANCE_REVIEWER`, but
 * `UpdateUserRoleDto` rejects it, so it is displayed and filtered rather than
 * offered. Add it here once that DTO is widened; nothing else needs to change.
 */
export const ASSIGNABLE_ROLES = ["USER", "ADMIN"] as const;

export type AssignableAdminUserRole = (typeof ASSIGNABLE_ROLES)[number];

/** FR-901: the write DTO is narrower than the roles returned by session reads. */
export const updateUserRoleSchema = z.object({
  role: z.enum(ASSIGNABLE_ROLES),
});
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;

export const ADMIN_USER_ROLE_LABELS: Record<AdminUserRole, string> = {
  USER: "Member",
  COMPLIANCE_REVIEWER: "Compliance reviewer",
  ADMIN: "Administrator",
};

export const ADMIN_USER_ROLE_DESCRIPTIONS: Record<AdminUserRole, string> = {
  USER: "Can back campaigns and build ideas. No admin access.",
  COMPLIANCE_REVIEWER:
    "Can read verification cases and record risk reviews. No platform settings.",
  ADMIN:
    "Full access: campaign review, verification, payments and this directory.",
};

export const ADMIN_USER_ROLE_TONES: Record<AdminUserRole, PillTone> = {
  USER: "neutral",
  COMPLIANCE_REVIEWER: "warning",
  ADMIN: "accent",
};

export const ADMIN_KYC_LABELS: Record<AdminKycStatus, string> = {
  NOT_REQUIRED: "KYC not required",
  PENDING: "KYC pending",
  VERIFIED: "KYC verified",
  REJECTED: "KYC rejected",
};

export const ADMIN_KYC_TONES: Record<AdminKycStatus, PillTone> = {
  NOT_REQUIRED: "neutral",
  PENDING: "warning",
  VERIFIED: "accent",
  REJECTED: "danger",
};

export function isAdminUserRole(value: unknown): value is AdminUserRole {
  return adminUserRoleSchema.safeParse(value).success;
}

/**
 * "amara.okonkwo@example.com" -> "Amara Okonkwo".
 *
 * The API exposes no display name, so the avatar is built from the address. An
 * address with no readable local part falls back to the account id rather than
 * rendering an empty mark.
 */
export function adminUserDisplayName(user: AdminUser): string {
  const local = user.email?.split("@")[0]?.trim();
  if (!local) return `Account ${user.id.slice(0, 8)}`;

  const words = local
    .split(/[._-]+/)
    .filter(Boolean)
    .slice(0, 2);
  const name = words
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");

  return name || local;
}

const joinedDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

/**
 * Fixed UTC formatting so the server render and any client render agree.
 * An unparseable timestamp is shown as unknown, never as "Invalid Date".
 */
export function formatAdminUserDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Unknown" : joinedDate.format(date);
}

export function adminUsersHref(input: {
  query?: string;
  role?: AdminUserRole | undefined;
  offset?: number;
}): string {
  const params = new URLSearchParams();
  if (input.query) params.set("q", input.query);
  if (input.role) params.set("role", input.role);
  if (input.offset && input.offset > 0) {
    params.set("offset", String(input.offset));
  }

  const search = params.toString();
  return search ? `/admin/users?${search}` : "/admin/users";
}
