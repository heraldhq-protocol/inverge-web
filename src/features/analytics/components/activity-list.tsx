import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Coins01Icon,
  Comment01Icon,
  Idea01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

import type {
  AnalyticsActivity,
  AnalyticsDataSource,
} from "@/features/analytics/lib/types";
import { formatSeriesDate } from "@/features/analytics/lib/analytics";

const icons: Record<AnalyticsActivity["kind"], IconSvgElement> = {
  feedback: Comment01Icon,
  interest: Coins01Icon,
  published: Idea01Icon,
  supporter: UserMultiple02Icon,
};

/**
 * Recent activity, aggregate by design. Support events never expose a
 * supporter's identity, and a pre-pledge event shows intent, not a payment.
 */
export function ActivityList({
  activity,
  dataSource,
}: {
  activity: readonly AnalyticsActivity[];
  dataSource: AnalyticsDataSource;
}) {
  return (
    <section
      aria-labelledby="recent-activity"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-activity" className="text-sm font-bold text-ink">
          Recent activity
        </h2>
        {dataSource === "live" ? (
          <span className="text-[0.6875rem] text-muted">Live API</span>
        ) : null}
      </div>

      {activity.length > 0 ? (
        <ol className="mt-3 divide-y divide-border">
          {activity.map((item) => (
            <li
              key={`${item.date}-${item.title}`}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-canvas text-muted">
                <HugeiconsIcon
                  icon={icons[item.kind]}
                  size={15}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className="text-xs font-semibold text-ink">{item.title}</p>
                  <time
                    dateTime={item.date}
                    className="text-[0.6875rem] tabular-nums text-muted"
                  >
                    {formatSeriesDate(item.date, true)}
                  </time>
                </div>
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs text-muted">
          No activity recorded yet. New supporters, feedback, and pre-pledges
          appear here.
        </p>
      )}
    </section>
  );
}
