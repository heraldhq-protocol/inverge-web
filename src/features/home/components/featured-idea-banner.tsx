import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { ideaViewHref } from "@/features/ideas/lib/idea-link";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import type { DiscoveryIdea } from "@/features/ideas/types";

/**
 * The editorial banner.
 *
 * Text and image sit in separate panels rather than layering copy over
 * photography, so contrast never depends on which cover an idea happens to
 * have. The headline is Inverge's own invitation; the idea shown beneath it is
 * the real record the button opens.
 */
export function FeaturedIdeaBanner({ idea }: { idea: DiscoveryIdea }) {
  return (
    <section
      aria-labelledby="featured-heading"
      className="overflow-hidden rounded-3xl border border-border bg-brand-tint"
    >
      <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex flex-col p-5 sm:p-7 lg:p-8">
          <p
            className="w-fit rounded-sm bg-surface/70 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-brand-strong"
            title={
              idea.promoted
                ? "Paid placement affects visibility only, never validation metrics"
                : undefined
            }
          >
            {idea.promoted ? "Promoted idea" : "Featured idea"}
          </p>

          <h2
            id="featured-heading"
            className="mt-3 text-balance text-2xl font-bold leading-[1.1] tracking-[-0.04em] text-ink sm:text-3xl lg:text-[2.35rem]"
          >
            Real ideas. Local impact.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
            Discover solutions from African creators building a better tomorrow.
          </p>

          <div className="mt-5 border-t border-brand/15 pt-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
              {idea.category}
            </p>
            <Link
              href={ideaViewHref(idea.id, "feed")}
              className="mt-1 inline-flex text-base font-bold tracking-[-0.02em] text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-lg"
            >
              {idea.title}
            </Link>
            <p className="mt-1 text-xs text-muted">
              By {idea.creator} · {idea.supporters.toLocaleString("en-US")}{" "}
              supporters · {idea.validationPercent}% validated
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={ideaViewHref(idea.id, "feed")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-contrast px-5 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Explore this idea
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/d/discover"
              className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Browse all ideas
            </Link>
          </div>
        </div>

        <div className="relative min-h-52 bg-surface-muted md:min-h-full">
          <IdeaCover
            artwork={idea.artwork}
            cover={idea.cover}
            alt={`${idea.title} by ${idea.creator}`}
            priority
            sizes="(min-width: 1280px) 520px, (min-width: 768px) 46vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
