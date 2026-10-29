import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authHref } from "@/features/auth/lib/auth-routes";
import { PATHNAME_HEADER } from "@/features/auth/lib/protected-routes";
import { readSessionUser } from "@/features/auth/server/session-user";
import {
  AdminAccessDenied,
  AdminShell,
} from "@/features/programmes/components/admin-shell";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Admin workspace",
  description:
    "Review campaigns, run ideathons, sponsor challenges, showcases, and workshops, and audit privileged actions.",
  robots: { follow: false, index: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getProgrammeAdminAccess();

  if (!access.allowed) {
    const user = await readSessionUser();
    if (!user) {
      const pathname = (await headers()).get(PATHNAME_HEADER) ?? "/admin";
      redirect(authHref(pathname));
    }

    return <AdminAccessDenied reason={access.reason} />;
  }

  return <AdminShell access={access}>{children}</AdminShell>;
}
