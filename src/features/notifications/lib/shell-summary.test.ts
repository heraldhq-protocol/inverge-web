import { describe, expect, it } from "vitest";

import { shellNotifications } from "@/features/notifications/lib/shell-summary";
import type { NotificationRecord } from "@/features/notifications/types";

function record(
  overrides: Partial<NotificationRecord> & Pick<NotificationRecord, "id">,
): NotificationRecord {
  return {
    actionHref: "/d/notifications",
    actionLabel: "View",
    artwork: "campus",
    group: "today",
    isRead: false,
    kind: "campaigns",
    message: "A message",
    occurredAt: "2026-10-01T09:00:00.000Z",
    timeLabel: "1 hour ago",
    title: "A title",
    ...overrides,
  };
}

describe("shellNotifications", () => {
  it("counts unread records independently of the visible slice", () => {
    const summary = shellNotifications(
      [
        record({ id: "a", isRead: false }),
        record({ id: "b", isRead: false }),
        record({ id: "c", isRead: true }),
      ],
      1,
    );

    expect(summary.unreadCount).toBe(2);
    expect(summary.items).toHaveLength(1);
  });

  it("puts unread first, then most recent", () => {
    const summary = shellNotifications([
      record({
        id: "read-newer",
        isRead: true,
        occurredAt: "2026-10-05T09:00:00.000Z",
      }),
      record({
        id: "unread-older",
        isRead: false,
        occurredAt: "2026-10-01T09:00:00.000Z",
      }),
      record({
        id: "unread-newer",
        isRead: false,
        occurredAt: "2026-10-04T09:00:00.000Z",
      }),
    ]);

    expect(summary.items.map((item) => item.id)).toEqual([
      "unread-newer",
      "unread-older",
      "read-newer",
    ]);
  });

  it("never invents a count for an empty centre", () => {
    expect(shellNotifications([])).toEqual({ items: [], unreadCount: 0 });
  });
});
