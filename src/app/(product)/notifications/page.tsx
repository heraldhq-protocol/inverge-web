import type { Metadata } from "next";

import { NotificationsDashboard } from "@/features/notifications/components/notifications-dashboard";
import { notificationsPreviewData } from "@/features/notifications/content/preview-data";
import {
  isNotificationFilter,
  type NotificationFilter,
} from "@/features/notifications/types";

export const metadata: Metadata = {
  title: "Notifications | Inverge",
  description: "Review campaign, milestone, and refund updates on Inverge.",
};

type NotificationsPageProps = {
  searchParams: Promise<{
    filter?: string | string[];
    q?: string | string[];
  }>;
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  const selectedFilter: NotificationFilter =
    typeof params.filter === "string" && isNotificationFilter(params.filter)
      ? params.filter
      : "all";

  return (
    <NotificationsDashboard
      items={notificationsPreviewData}
      query={query}
      selectedFilter={selectedFilter}
    />
  );
}
