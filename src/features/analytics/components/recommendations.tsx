import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Target02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import type { Recommendation } from "@/features/analytics/lib/analytics";

/**
 * Next steps grounded in the current gate and observed feedback. This is not a
 * second quality score: each item names the threshold or count it came from.
 */
export function Recommendations({
  recommendations,
}: {
  recommendations: readonly Recommendation[];
}) {
  return (
    <section
      aria-labelledby="recommendations-title"
      id="recommendations"
      className="scroll-mt-24"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="recommendations-title"
            className="text-sm font-bold text-ink sm:text-base"
          >
            Recommended next steps
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Based on your launch thresholds and the feedback already received.
          </p>
        </div>
      </div>

      <ul className="mt-3 grid gap-3 lg:grid-cols-3">
        {recommendations.map((recommendation, index) => (
          <li
            key={recommendation.key}
            className="flex flex-col rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-brand-soft text-[0.625rem] font-bold tabular-nums text-brand-strong">
                {index + 1}
              </span>
              <p className="text-sm font-semibold leading-snug text-ink">
                {recommendation.title}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">
              {recommendation.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Full-width ending band. It repeats the first recommendation as a summary and
 * sends the creator to the full list rather than leaving the workspace without a
 * next action.
 */
export function RecommendationsBand({
  recommendation,
}: {
  recommendation: Recommendation | undefined;
}) {
  if (!recommendation) return null;

  return (
    <aside className="flex flex-col gap-4 rounded-2xl bg-brand-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/12 text-brand-strong">
          {recommendation.key === "convert" ? (
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={18}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          ) : (
            <HugeiconsIcon
              icon={Target02Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          )}
        </span>
        <div>
          <p className="text-sm font-bold text-ink">{recommendation.title}</p>
          <p className="mt-0.5 max-w-2xl text-xs leading-5 text-muted">
            {recommendation.body}
          </p>
        </div>
      </div>
      <Link
        href="#recommendations"
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        View recommendations
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={15}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </Link>
    </aside>
  );
}
