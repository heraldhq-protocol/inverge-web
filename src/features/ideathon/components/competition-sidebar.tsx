import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Comment01Icon,
  Coins01Icon,
  Idea01Icon,
  TrophyIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Amount } from "@/components/ui/amount";
import { Eyebrow } from "@/components/ui/eyebrow";
import type {
  CompetitionCategoryBreakdown,
  CompetitionTotals,
  Ideathon,
} from "@/features/ideathon/types";

function Stat({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
        <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold tabular-nums leading-tight text-ink">
          {value}
        </p>
        <p className="mt-0.5 text-[0.6875rem] leading-4 text-muted">{label}</p>
      </div>
    </div>
  );
}

/**
 * Competition context beside the board. Every figure is an aggregate of the
 * competition's own entries; the prize is described as recognition fulfilled
 * outside the platform, never as a payout.
 */
export function CompetitionSidebar({
  categories,
  competition,
  totals,
}: {
  categories: readonly CompetitionCategoryBreakdown[];
  competition: Ideathon;
  totals: CompetitionTotals;
}) {
  return (
    <aside aria-label="Competition details" className="space-y-3">
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-base font-bold tracking-[-0.02em] text-ink">
          Your support fuels innovation
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Every support and pre-pledge helps creators get noticed and move closer
          to building real solutions.
        </p>
        <div className="mt-4 space-y-3.5">
          <Stat
            icon={UserMultiple02Icon}
            label="Total supporters"
            value={totals.supporters.toLocaleString("en-US")}
          />
          <Stat
            icon={Coins01Icon}
            label="Estimated interest"
            value={<Amount value={totals.estimatedInterest} compact />}
          />
          <Stat
            icon={Comment01Icon}
            label="Structured feedback"
            value={totals.feedback.toLocaleString("en-US")}
          />
        </div>
        <Link
          href="/ideathon/rules"
          className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          How it works
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
            <HugeiconsIcon
              icon={TrophyIcon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0">
            <Eyebrow className="text-muted">This month&apos;s prize</Eyebrow>
            <p className="mt-1 text-sm font-bold leading-snug text-ink">
              {competition.prizeDescription}
            </p>
          </div>
        </div>
        <Link
          href="/ideathon/rules"
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View rules
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-bold text-ink">Top topics</h2>
        <ul className="mt-3 space-y-2">
          {categories.slice(0, 5).map((item) => (
            <li key={item.categoryValue}>
              <Link
                href={`/ideas?category=${item.categoryValue}`}
                className="flex min-h-9 items-center justify-between gap-3 rounded-lg px-1.5 text-xs transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="font-medium text-ink-soft">{item.category}</span>
                <span className="tabular-nums text-muted">
                  {item.count} {item.count === 1 ? "idea" : "ideas"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/ideas"
          className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View all categories
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </section>

      <section className="rounded-2xl bg-brand-soft p-4">
        <span className="grid size-9 place-items-center rounded-xl bg-brand/12 text-brand-strong">
          <HugeiconsIcon
            icon={Idea01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h2 className="mt-3 text-base font-bold tracking-[-0.02em] text-ink">
          Got an idea?
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Join the next ideathon and turn your idea into something real.
        </p>
        <Link
          href="/sign-up"
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Start an idea
        </Link>
      </section>
    </aside>
  );
}
