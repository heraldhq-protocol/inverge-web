import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { PhaseBadge } from "@/features/programmes/components/phase-badge";
import type { PublicProgramme } from "@/features/programmes/api/types";
import {
  formatDateRange,
  PROGRAMME_TYPE_LABELS,
} from "@/features/programmes/lib/public-programme";

/**
 * One public programme, presented as an editorial entry rather than a generic
 * product card. Every number shown is present in the API response: there are no
 * invented participant counts, prize totals or countdowns.
 */
export function ProgrammeCard({
  index,
  programme,
}: {
  index: number;
  programme: PublicProgramme;
}) {
  return (
    <Link
      href={`/ideathon/${programme.slug}`}
      className="group relative flex min-w-0 flex-col justify-between border-t border-border py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:py-6"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="font-mono text-[0.6875rem] tabular-nums text-muted"
            >
              {String(index).padStart(2, "0")}
            </span>
            <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-muted">
              {PROGRAMME_TYPE_LABELS[programme.type]}
            </span>
          </div>
          <PhaseBadge phase={programme.phase} />
        </div>

        <h3 className="mt-4 max-w-[26ch] text-balance text-2xl font-bold leading-[1.08] tracking-[-0.045em] text-ink transition-colors group-hover:text-brand-strong sm:text-[1.75rem]">
          {programme.title}
        </h3>
        <p className="mt-2 max-w-[52ch] text-sm leading-6 text-ink-soft">
          {programme.tagline || programme.description}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          {formatDateRange(
            programme.timeline.registrationOpensAt,
            programme.timeline.judgingEndsAt,
          )}
        </span>
        {programme.entryCount > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <HugeiconsIcon
              icon={UserGroupIcon}
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            {programme.entryCount}{" "}
            {programme.entryCount === 1 ? "entry" : "entries"}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-brand-strong">
          Read the brief
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </span>
      </div>
    </Link>
  );
}
