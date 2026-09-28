import type { IdeaArtworkVariant } from "@/features/home/types";

export type NotificationFilter =
  "all" | "unread" | "campaigns" | "milestones" | "refunds";

export type NotificationKind = Exclude<NotificationFilter, "all" | "unread">;
export type NotificationGroup = "today" | "this-week" | "older";

export type NotificationRecord = {
  actionHref: string;
  actionLabel: string;
  artwork: IdeaArtworkVariant | "refund";
  group: NotificationGroup;
  id: string;
  isRead: boolean;
  kind: NotificationKind;
  message: string;
  occurredAt: string;
  timeLabel: string;
  title: string;
};

export function isNotificationFilter(
  value: string,
): value is NotificationFilter {
  return ["all", "unread", "campaigns", "milestones", "refunds"].includes(
    value,
  );
}
