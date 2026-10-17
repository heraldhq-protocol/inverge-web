import type { ShellNotification } from "@/features/app-shell/types";
import type { NotificationRecord } from "@/features/notifications/types";

/**
 * The header menu's summary of the notification centre.
 *
 * Unread first, then most recent. The full list stays on `/d/notifications`;
 * the menu is a glance, not a second inbox. Counts are derived from the same
 * records the centre renders, so the badge can never disagree with the list.
 */
export function shellNotifications(
  items: readonly NotificationRecord[],
  limit = 4,
): { items: ShellNotification[]; unreadCount: number } {
  const unreadCount = items.filter((item) => !item.isRead).length;

  const ordered = [...items].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return Date.parse(b.occurredAt) - Date.parse(a.occurredAt);
  });

  return {
    items: ordered.slice(0, Math.max(0, limit)).map((item) => ({
      href: item.actionHref,
      id: item.id,
      isRead: item.isRead,
      message: item.message,
      // The centre already formats these labels; re-deriving them from
      // `occurredAt` would make the menu and the centre disagree.
      timeLabel: item.timeLabel,
      title: item.title,
    })),
    unreadCount,
  };
}
