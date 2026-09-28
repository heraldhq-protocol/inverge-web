"use client";

import { CheckCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { StatePanel } from "@/components/ui/state-panel";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import type {
  NotificationFilter,
  NotificationGroup,
  NotificationRecord,
} from "@/features/notifications/types";

const filters: { label: string; value: NotificationFilter }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "campaigns", label: "Campaigns" },
  { value: "milestones", label: "Milestones" },
  { value: "refunds", label: "Refunds" },
];

const groups: { label: string; value: NotificationGroup }[] = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "Earlier this week" },
  { value: "older", label: "Older" },
];

function matchesQuery(item: NotificationRecord, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  return [item.title, item.message, item.actionLabel].some((value) =>
    value.toLocaleLowerCase().includes(normalizedQuery),
  );
}

function filterHref(filter: NotificationFilter, query: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (filter !== "all") params.set("filter", filter);
  const search = params.toString();
  return search ? `/notifications?${search}` : "/notifications";
}

export function NotificationCenter({
  items,
  query,
  selectedFilter,
}: {
  items: NotificationRecord[];
  query: string;
  selectedFilter: NotificationFilter;
}) {
  const [readIds, setReadIds] = useState(
    () => new Set(items.filter((item) => item.isRead).map((item) => item.id)),
  );
  const unreadCount = items.filter((item) => !readIds.has(item.id)).length;
  const visibleItems = items.filter((item) => {
    if (!matchesQuery(item, query)) return false;
    if (selectedFilter === "unread") return !readIds.has(item.id);
    if (selectedFilter === "all") return true;
    return item.kind === selectedFilter;
  });

  function markAllAsRead() {
    setReadIds(new Set(items.map((item) => item.id)));
  }

  function markAsRead(id: string) {
    setReadIds((current) => new Set(current).add(id));
  }

  return (
    <>
      <div className="mt-6 border-b border-border">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:text-muted"
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            {unreadCount === 0 ? "All read" : "Mark all as read"}
          </button>
        </div>

        <nav
          aria-label="Notification filters"
          className="-mx-4 sm:-mx-6 lg:mx-0"
        >
          <ul className="flex gap-6 overflow-x-auto px-4 sm:px-6 lg:px-0">
            {filters.map((filter) => {
              const isCurrent = selectedFilter === filter.value;

              return (
                <li key={filter.value} className="shrink-0">
                  <Link
                    href={filterHref(filter.value, query)}
                    scroll={false}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-1.5 border-b-2 px-1 pb-3 pt-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      isCurrent
                        ? "border-brand font-semibold text-brand-strong"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {filter.label}
                    {filter.value === "unread" && unreadCount > 0 ? (
                      <span className="grid min-w-5 place-items-center rounded-full bg-brand/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-brand-strong">
                        {unreadCount}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {visibleItems.length > 0 ? (
        <div className="space-y-7 py-7 sm:space-y-8 sm:py-8">
          {groups.map((group) => {
            const groupItems = visibleItems.filter(
              (item) => item.group === group.value,
            );
            if (groupItems.length === 0) return null;

            return (
              <section
                key={group.value}
                aria-labelledby={`notifications-${group.value}`}
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2
                    id={`notifications-${group.value}`}
                    className="text-xs font-bold uppercase tracking-[0.12em] text-muted"
                  >
                    {group.label}
                  </h2>
                  <span className="text-xs text-muted">
                    {groupItems.length}{" "}
                    {groupItems.length === 1 ? "update" : "updates"}
                  </span>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_35px_rgba(13,29,21,0.035)]">
                  {groupItems.map((item) => (
                    <NotificationItem
                      key={item.id}
                      item={item}
                      isRead={readIds.has(item.id)}
                      onOpen={() => markAsRead(item.id)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
          <p className="text-center text-xs text-muted">
            Showing all {visibleItems.length} matching notifications
          </p>
        </div>
      ) : (
        <div className="py-7 sm:py-8">
          <StatePanel
            variant="empty"
            eyebrow={query ? "No matches" : "All caught up"}
            title={
              selectedFilter === "unread"
                ? "You have no unread notifications"
                : "No notifications found"
            }
            description={
              query
                ? "Try a broader search or clear the current notification filter."
                : "New campaign, milestone, and refund updates will appear here."
            }
            action={
              <Link
                href="/notifications"
                scroll={false}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Show all notifications
              </Link>
            }
          />
        </div>
      )}
    </>
  );
}
