import { describe, expect, it } from "vitest";

import { toActivityItems } from "@/features/home/lib/activity";
import type { NotificationRecord } from "@/features/notifications/types";

function record(
  overrides: Partial<NotificationRecord> & Pick<NotificationRecord, "id">,
): NotificationRecord {
  return {
    actionHref: "/d/notifications",
    actionLabel: "View",
    artwork: "campus",
    group: "today",
    isRead: true,
    kind: "campaigns",
    message: "A message",
    occurredAt: "2026-10-01T09:00:00.000Z",
    timeLabel: "1 hour ago",
    title: "A title",
    ...overrides,
  };
}

describe("toActivityItems", () => {
  it("projects notification kinds onto activity kinds", () => {
    const [item] = toActivityItems([record({ id: "m", kind: "milestones" })]);

    expect(item).toMatchObject({
      href: "/d/notifications",
      id: "m",
      kind: "milestone",
      timeLabel: "1 hour ago",
    });
  });

  it("orders newest first regardless of read state", () => {
    const items = toActivityItems([
      record({
        id: "old-unread",
        isRead: false,
        occurredAt: "2026-10-01T09:00:00.000Z",
      }),
      record({
        id: "new-read",
        isRead: true,
        occurredAt: "2026-10-05T09:00:00.000Z",
      }),
    ]);

    expect(items.map((item) => item.id)).toEqual(["new-read", "old-unread"]);
  });

  it("limits the rail without mutating the input order", () => {
    const input = [
      record({ id: "a", occurredAt: "2026-10-01T09:00:00.000Z" }),
      record({ id: "b", occurredAt: "2026-10-02T09:00:00.000Z" }),
      record({ id: "c", occurredAt: "2026-10-03T09:00:00.000Z" }),
    ];

    expect(toActivityItems(input, 2).map((item) => item.id)).toEqual([
      "c",
      "b",
    ]);
    expect(input.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("returns nothing for an empty centre", () => {
    expect(toActivityItems([])).toEqual([]);
  });
});
