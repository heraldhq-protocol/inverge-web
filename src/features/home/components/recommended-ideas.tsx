import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { IdeaCover } from "@/features/ideas/components/idea-cover";
import type { DiscoveryIdea } from "@/features/ideas/types";
import { formatCompactMoney } from "@/lib/money";

/**
 * Additional public ideas, ordered by observed support.
 *
 * The heading stays descriptive because no personalisation exists: these are
 * not "picked for you", they are public ideas the page above has not shown yet.
 */
export function RecommendedIdeas({
  ideas,
}: {
  ideas: readonly DiscoveryIdea[];
}) {
  return (
    <section
      aria-labelledby="more-ideas-heading"
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2
          id="more-ideas-heading"
          className="text-sm font-bold tracking-[-0.01em] text-ink"
        >
          More to explore
        </h2>
        <Link
          href="/d/discover"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-1 text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          See all
        </Link>
      </div>

      {ideas.length > 0 ? (
        <ul className="border-t border-border/70">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="border-b border-border/70 last:border-b-0"
            >
              <Link
                href={`/ideas/${idea.id}`}
                className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  <IdeaCover
                    artwork={idea.artwork}
                    cover={idea.cover}
                    alt=""
                    sizes="48px"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {idea.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {idea.category} · {idea.supporters.toLocaleString("en-US")}{" "}
                    supporters · {formatCompactMoney(idea.prePledged)}
                  </span>
                </span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={15}
                  strokeWidth={1.9}
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-colors group-hover:text-brand-strong"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-border/70 px-4 py-5 text-xs leading-5 text-muted">
          Ideas will appear here as creators publish them for validation.
        </p>
      )}
    </section>
  );
}
