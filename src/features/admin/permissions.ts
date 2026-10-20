/**
 * Admin roles and permissions.
 *
 * The API remains the authority. This matrix is shared by the web preview so a
 * hidden control and the domain guard read the same rule, and so adding a new
 * admin operation does not create a second permission vocabulary.
 */
export type AdminRole = "platform_admin" | "organiser" | "judge";

export type AdminActor = {
  id: string;
  name: string;
  role: AdminRole;
};

export type AdminPermission =
  | "programme:create"
  | "programme:edit"
  | "programme:publish"
  | "programme:archive"
  | "submission:moderate"
  | "judging:score"
  | "results:publish"
  | "rewards:fulfil"
  | "sponsors:manage"
  | "payments:confirm"
  | "campaign:review"
  | "settings:manage";

export const ROLE_PERMISSIONS: Readonly<
  Record<AdminRole, readonly AdminPermission[]>
> = {
  platform_admin: [
    "programme:create",
    "programme:edit",
    "programme:publish",
    "programme:archive",
    "submission:moderate",
    "judging:score",
    "results:publish",
    "rewards:fulfil",
    "sponsors:manage",
    "payments:confirm",
    "campaign:review",
    "settings:manage",
  ],
  organiser: [
    "programme:edit",
    "programme:publish",
    "submission:moderate",
    "rewards:fulfil",
    "sponsors:manage",
  ],
  judge: ["judging:score"],
};

export function adminCan(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
