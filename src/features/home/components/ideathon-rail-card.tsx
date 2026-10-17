import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, TrophyIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import type { HomeIdeathon } from "@/features/home/types";

/**
 * The ideathon slot in the right rail.
 *
 * Status and dates come from the programme record; participation is a separate
 * fact the fixture cannot confirm, so the card links out and never says
 * "registered".
 */
export function IdeathonRailCard({ ideathon }: { ideathon: HomeIdeathon }) {
  return (
    <section
      aria-labelledby="ideathon-heading"
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={TrophyIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="ideathon-heading"
              className="text-sm font-bold tracking-[-0.01em] text-ink"
            >
              Ideathon
            </h2>
            <Pill tone="accent" size="xs">
              {ideathon.statusLabel}
            </Pill>
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-ink">
            {ideathon.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted">
            {ideathon.theme}
          </p>
          <p className="mt-2 text-[0.6875rem] text-muted">
            {ideathon.closesLabel ?? "Dates are being confirmed"}
          </p>
        </div>
      </div>

      <Link
        href={ideathon.href}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-canvas px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        View programme
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={14}
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
