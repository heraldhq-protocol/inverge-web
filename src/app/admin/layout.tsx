import type { Metadata } from "next";

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = getProgrammeAdminAccess();
  if (!access.allowed) {
    return <AdminAccessDenied reason={access.reason} />;
  }

  return <AdminShell access={access}>{children}</AdminShell>;
}
