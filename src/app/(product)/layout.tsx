import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/features/app-shell/components/app-shell";
import { getDashboardViewer } from "@/features/app-shell/server/viewer";
import type { ShellData } from "@/features/app-shell/types";
import { authHref } from "@/features/auth/lib/auth-routes";
import { PATHNAME_HEADER } from "@/features/auth/lib/protected-routes";
import { readSessionUser } from "@/features/auth/server/session-user";
import { shellNotifications } from "@/features/notifications/lib/shell-summary";
import { getNotificationsView } from "@/features/notifications/server/notifications";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

/**
 * The signed-in dashboard holds a creator's own analytics, pre-pledges, and
 * settings. None of it belongs in an index, and the routes are gated here on
 * the server: the session is exchanged with the API before the shell renders.
 */
export const metadata: Metadata = { robots: PRIVATE_ROBOTS };

export default async function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await readSessionUser();

  if (!user) {
    const pathname = (await headers()).get(PATHNAME_HEADER) ?? "/d";
    redirect(authHref(pathname));
  }

  const viewer = await getDashboardViewer();
  const notificationsResult = await getNotificationsView();
  const notifications =
    notificationsResult.status === "ready"
      ? shellNotifications(notificationsResult.view.items, 4)
      : { items: [], unreadCount: 0 };

  const shell: ShellData = {
    notifications: notifications.items,
    unreadCount: notifications.unreadCount,
    viewer,
  };

  return <AppShell data={shell}>{children}</AppShell>;
}
