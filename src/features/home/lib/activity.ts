import type { ActivityItem, ActivityKind } from "@/features/home/types";
import type {
  NotificationKind,
  NotificationRecord,
} from "@/features/notifications/types";

const activityKind: Record<NotificationKind, ActivityKind> = {
  campaigns: "campaign",
  milestones: "milestone",
  refunds: "refund",
};

/**
 * The activity rail's rows.
 *
 * The rail is a projection of the notification centre, not a second event log.
 * Ordering is strictly chronological — a summary panel that reorders by read
 * state would make "2 hours ago" appear under yesterday.
 */
export function toActivityItems(
  items: readonly NotificationRecord[],
  limit = 4,
): ActivityItem[] {
  return [...items]
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, Math.max(0, limit))
    .map((item) => ({
      description: item.message,
      href: item.actionHref,
      id: item.id,
      kind: activityKind[item.kind],
      timeLabel: item.timeLabel,
      title: item.title,
    }));
}
