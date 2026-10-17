import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

/**
 * A compact, honest unavailable state for a metric that the current analytics
 * API does not return. It explains what will appear here and why it is absent,
 * instead of drawing a chart from invented values.
 */
export function AnalyticsUnavailable({
  bullets,
  description,
  icon,
  title,
}: {
  bullets?: readonly string[];
  description: string;
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border-strong bg-canvas p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-muted">
          <HugeiconsIcon
            icon={icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-ink">{title}</h2>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-muted">
              Not connected
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
          {bullets && bullets.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-1.5 text-[0.6875rem] leading-5 text-ink-soft"
                >
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    size={12}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-muted"
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
