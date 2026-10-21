import type { Metadata } from "next";

import { AppShell } from "@/features/app-shell/components/app-shell";
import { getDashboardViewer } from "@/features/app-shell/server/viewer";
import type { ShellData } from "@/features/app-shell/types";
import { notificationsPreviewData } from "@/features/notifications/content/preview-data";
import { shellNotifications } from "@/features/notifications/lib/shell-summary";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

/**
 * The signed-in dashboard holds a creator's own analytics, pre-pledges, and
 * settings. None of it belongs in an index, and none of it is protected by
 * this line: the routes are gated on the server.
 */
export const metadata: Metadata = { robots: PRIVATE_ROBOTS };

export default async function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getDashboardViewer();
  const notifications = shellNotifications(notificationsPreviewData, 4);

  const shell: ShellData = {
    notifications: notifications.items,
    unreadCount: notifications.unreadCount,
    viewer,
  };

  return <AppShell data={shell}>{children}</AppShell>;
}
