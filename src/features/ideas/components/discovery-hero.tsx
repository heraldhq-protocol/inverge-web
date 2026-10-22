import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { ideaTaxonomyText } from "@/features/ideas/lib/filter-ideas";
import type { DiscoveryIdea } from "@/features/ideas/types";
import { formatCompactMoney } from "@/lib/money";

export type HeroFeaturedIdea = DiscoveryIdea;

/**
 * The featured idea that overlaps the discovery hero image.
 *
 * It is a real catalogue record, not an invented showcase. The `Featured` label
 * describes editorial placement; when the record is also paid placement the
 * card says `Promoted` instead, because FR-206a requires that distinction to be
 * explicit.
 */
export function DiscoveryHeroFeatured({ idea }: { idea: HeroFeaturedIdea }) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="group block rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-ink/[0.08] transition-[border-color,box-shadow] hover:border-brand/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="flex items-center justify-between gap-3">
        <Pill tone={idea.promoted ? "promoted" : "accent"} size="xs">
          {idea.promoted ? "Promoted" : "Featured"}
        </Pill>
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand-strong transition-colors group-hover:bg-brand group-hover:text-white"
        >
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
        </span>
      </div>

      <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug tracking-[-0.025em] text-ink">
        {idea.title}
      </h2>
      <p className="mt-1 text-xs text-muted">{ideaTaxonomyText(idea)}</p>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div className="min-w-0">
          <dd className="truncate text-sm font-semibold tabular-nums text-ink">
            {idea.supporters.toLocaleString("en-US")}
          </dd>
          <dt className="mt-0.5 text-[0.625rem] leading-4 text-muted">
            Supporters
          </dt>
        </div>
        <div className="min-w-0">
          <dd className="truncate text-sm font-semibold tabular-nums text-ink">
            {formatCompactMoney(idea.prePledged)}
          </dd>
          <dt className="mt-0.5 text-[0.625rem] leading-4 text-muted">
            Est. interest
          </dt>
        </div>
        <div className="min-w-0">
          <dd className="truncate text-sm font-semibold tabular-nums text-ink">
            {idea.feedbackResponses.toLocaleString("en-US")}
          </dd>
          <dt className="mt-0.5 text-[0.625rem] leading-4 text-muted">
            Feedback
          </dt>
        </div>
      </dl>
    </Link>
  );
}
