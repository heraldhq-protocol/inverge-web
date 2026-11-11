import { describe, expect, it } from "vitest";
import { adminUserRoleSchema, updateUserRoleSchema } from "./users";

describe("FR-901 UpdateUserRoleDto", () => {
  it.each(["USER", "ADMIN"])("accepts the assignable role %s", (role) => {
    expect(updateUserRoleSchema.parse({ role })).toEqual({ role });
  });
  it.each([
    "platform_admin",
    "compliance_officer",
    "COMPLIANCE_REVIEWER",
    "admin",
    "",
    null,
  ])("rejects %s at the write boundary", (role) => {
    expect(updateUserRoleSchema.safeParse({ role }).success).toBe(false);
  });
  it("preserves the separately readable compliance session role", () => {
    expect(adminUserRoleSchema.safeParse("COMPLIANCE_REVIEWER").success).toBe(
      true,
    );
  });
});
