import { describe, expect, it } from "vitest";

import {
  ADMIN_USER_ROLE_LABELS,
  adminUserDisplayName,
  adminUserSchema,
  adminUsersHref,
  formatAdminUserDate,
  isAdminUserRole,
  type AdminUser,
} from "@/features/admin/lib/users";

const user: AdminUser = {
  id: "usr_1",
  email: "amara.okonkwo@example.com",
  providerUserId: "did:privy:abc",
  role: "ADMIN",
  kycStatus: "VERIFIED",
  bannedAt: null,
  createdAt: "2026-01-06T10:10:00.000Z",
};

describe("admin user model", () => {
  it("accepts the projection the API actually returns", () => {
    expect(adminUserSchema.safeParse(user).success).toBe(true);
  });

  it("accepts a missing email and a ban timestamp", () => {
    expect(
      adminUserSchema.safeParse({
        ...user,
        email: null,
        bannedAt: "2026-02-01T00:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("refuses unknown roles and KYC states instead of guessing", () => {
    expect(
      adminUserSchema.safeParse({ ...user, role: "SUPER_ADMIN" }).success,
    ).toBe(false);
    expect(
      adminUserSchema.safeParse({ ...user, kycStatus: "MAYBE" }).success,
    ).toBe(false);
    expect(adminUserSchema.safeParse({ ...user, id: "" }).success).toBe(false);
  });

  it("treats only stored roles as role values", () => {
    expect(isAdminUserRole("COMPLIANCE_REVIEWER")).toBe(true);
    expect(isAdminUserRole("platform_admin")).toBe(false);
    expect(isAdminUserRole(undefined)).toBe(false);
  });

  it("labels every stored role", () => {
    expect(ADMIN_USER_ROLE_LABELS).toEqual({
      USER: "Member",
      COMPLIANCE_REVIEWER: "Compliance reviewer",
      ADMIN: "Administrator",
    });
  });
});

describe("admin user presentation", () => {
  it("builds a readable name from the address", () => {
    expect(adminUserDisplayName(user)).toBe("Amara Okonkwo");
    expect(
      adminUserDisplayName({ ...user, email: "zainab_bello@example.com" }),
    ).toBe("Zainab Bello");
  });

  it("falls back to the account id when no name is readable", () => {
    expect(adminUserDisplayName({ ...user, email: null })).toBe(
      `Account ${user.id.slice(0, 8)}`,
    );
    expect(adminUserDisplayName({ ...user, email: "@example.com" })).toBe(
      "Account usr_1",
    );
  });

  it("formats dates in UTC and refuses to print an invalid one", () => {
    expect(formatAdminUserDate("2026-01-06T23:30:00.000Z")).toBe("6 Jan 2026");
    expect(formatAdminUserDate("not-a-date")).toBe("Unknown");
  });

  it("keeps filter state in the query string", () => {
    expect(adminUsersHref({})).toBe("/admin/users");
    expect(adminUsersHref({ query: "amara" })).toBe("/admin/users?q=amara");
    expect(adminUsersHref({ role: "ADMIN", offset: 25 })).toBe(
      "/admin/users?role=ADMIN&offset=25",
    );
    expect(adminUsersHref({ query: "a b", role: "USER" })).toBe(
      "/admin/users?q=a+b&role=USER",
    );
  });
});
