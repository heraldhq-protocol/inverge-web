import type { Metadata } from "next";

import {
  AdminUsersDirectory,
  AdminUsersUnavailable,
} from "@/features/admin/components/admin-users-directory";
import {
  ADMIN_USERS_MAX_OFFSET,
  ADMIN_USERS_PAGE_SIZE,
  isAdminUserRole,
} from "@/features/admin/lib/users";
import { adminCan } from "@/features/admin/permissions";
import { listAdminUsers } from "@/features/admin/server/users";

export const metadata: Metadata = {
  title: "Users and roles",
  description:
    "Grant or revoke platform administrator access and review account roles.",
  robots: { follow: false, index: false },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const role = isAdminUserRole(params.role) ? params.role : undefined;
  const requestedOffset =
    typeof params.offset === "string" ? Number.parseInt(params.offset, 10) : 0;
  const offset =
    Number.isFinite(requestedOffset) && requestedOffset > 0
      ? Math.min(requestedOffset, ADMIN_USERS_MAX_OFFSET)
      : 0;

  const result = await listAdminUsers({
    query,
    role,
    offset,
    limit: ADMIN_USERS_PAGE_SIZE,
  });

  if (result.status === "denied") return null;

  if (result.status === "unavailable") {
    return (
      <AdminUsersUnavailable
        reason={result.reason}
        query={query}
        role={role}
        offset={offset}
      />
    );
  }

  return (
    <AdminUsersDirectory
      users={result.users}
      actorId={result.actor.id}
      canManage={adminCan(result.actor.role, "users:manage")}
      preview={result.status === "preview"}
      query={query}
      role={role}
      offset={offset}
      hasMore={result.hasMore}
    />
  );
}
