import { RotateCcw } from "lucide-react";
import Link from "next/link";

import { IdeaArtwork } from "@/features/home/components/idea-artwork";
import type { NotificationRecord } from "@/features/notifications/types";

function NotificationArtwork({
  artwork,
}: {
  artwork: NotificationRecord["artwork"];
}) {
  if (artwork === "refund") {
    return (
      <div
        className="grid h-full min-h-32 place-items-center bg-gradient-to-br from-stone-50 to-stone-200 text-muted"
        aria-hidden="true"
      >
        <span className="grid size-14 place-items-center rounded-full bg-black/[0.06]">
          <RotateCcw className="size-7" strokeWidth={1.7} />
        </span>
      </div>
    );
  }

  return <IdeaArtwork compact variant={artwork} />;
}

export function NotificationItem({
  isRead,
  item,
  onOpen,
}: {
  isRead: boolean;
  item: NotificationRecord;
  onOpen: () => void;
}) {
  return (
    <li>
      <article
        className={`grid min-h-36 grid-cols-[5.75rem_minmax(0,1fr)] overflow-hidden sm:grid-cols-[7.5rem_minmax(0,1fr)] lg:grid-cols-[8.5rem_minmax(0,1fr)] ${
          isRead ? "bg-surface" : "bg-brand/[0.025]"
        }`}
      >
        <NotificationArtwork artwork={item.artwork} />
        <div className="grid min-w-0 gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] lg:items-center lg:gap-6">
          <div className="min-w-0">
            <div className="flex items-start gap-2.5">
              {!isRead ? (
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                  aria-label="Unread"
                />
              ) : null}
              <div className="min-w-0">
                <h3
                  className={`text-base leading-5 tracking-[-0.015em] text-ink sm:text-[1.0625rem] ${
                    isRead ? "font-semibold" : "font-bold"
                  }`}
                >
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-5 text-muted">
                  {item.message}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 border-t border-border/70 pt-3 lg:min-w-56 lg:border-0 lg:pt-0">
            <time
              dateTime={item.occurredAt}
              className="whitespace-nowrap text-xs text-muted"
            >
              {item.timeLabel}
            </time>
            <Link
              href={item.actionHref}
              onClick={onOpen}
              className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {item.actionLabel}
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}
