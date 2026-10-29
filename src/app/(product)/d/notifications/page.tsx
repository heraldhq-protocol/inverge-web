import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StatePanel } from "@/components/ui/state-panel";
import { NotificationsDashboard } from "@/features/notifications/components/notifications-dashboard";
import { getNotificationsView } from "@/features/notifications/server/notifications";
import {
  isNotificationFilter,
  type NotificationFilter,
} from "@/features/notifications/types";

export const metadata: Metadata = {
  title: "Notifications",
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
  const result = await getNotificationsView();

  if (result.status === "signed_out") {
    redirect(`/auth?next=${encodeURIComponent("/d/notifications")}`);
  }

  if (result.status === "unavailable") {
    return (
      <NotificationsDashboard
        dataSource="live"
        items={[]}
        query={query}
        selectedFilter={selectedFilter}
        state={
          <div className="mt-6">
            <StatePanel
              variant="error"
              eyebrow="Notifications unavailable"
              title="We couldn't load your updates"
              description={result.reason}
              action={
                <a
                  href="/d/notifications"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Try again
                </a>
              }
            />
          </div>
        }
      />
    );
  }

  return (
    <NotificationsDashboard
      dataSource={result.view.dataSource}
      items={result.view.items}
      query={query}
      selectedFilter={selectedFilter}
      truncated={result.view.truncated}
    />
  );
}
