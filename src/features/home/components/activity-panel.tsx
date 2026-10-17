import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  ChartLineData02Icon,
  Comment01Icon,
  FavouriteIcon,
  Notification01Icon,
  Refresh01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import type { ActivityItem, ActivityKind } from "@/features/home/types";

const kindMeta: Record<ActivityKind, { icon: IconSvgElement; label: string }> =
  {
    campaign: { icon: ChartLineData02Icon, label: "Campaign update" },
    feedback: { icon: Comment01Icon, label: "Feedback" },
    follower: { icon: UserAdd01Icon, label: "New follower" },
    milestone: { icon: Notification01Icon, label: "Milestone update" },
    refund: { icon: Refresh01Icon, label: "Refund" },
  };

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = kindMeta[item.kind];

  return (
    <li className="border-b border-border/70 last:border-b-0">
      <Link
        href={item.href}
        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={meta.icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0">
          <span className="block text-[0.8125rem] font-semibold leading-5 text-ink">
            {item.title}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted">
            {item.description}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-[0.6875rem] text-muted">
            <span className="sr-only">{meta.label}. </span>
            {item.timeLabel}
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * "Your activity" — the last few things the notification centre holds.
 *
 * One event system, two surfaces: the rail renders the same records as
 * `/d/notifications` and adds no events of its own.
 */
export function ActivityPanel({ items }: { items: readonly ActivityItem[] }) {
  return (
    <section
      aria-labelledby="activity-heading"
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2
          id="activity-heading"
          className="text-sm font-bold tracking-[-0.01em] text-ink"
        >
          Your activity
        </h2>
        <Link
          href="/d/notifications"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-1 text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View all
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={13}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="border-t border-border/70">
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="border-t border-border/70 px-4 py-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-brand-strong"
            />
            Nothing yet
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Support an idea or follow a creator and their updates will appear
            here.
          </p>
        </div>
      )}
    </section>
  );
}
