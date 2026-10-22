import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

import { AdDismissButton } from "@/features/advertising/components/ad-dismiss-button";
import { AdInteraction } from "@/features/advertising/components/ad-interaction";
import { AdLabel } from "@/features/advertising/components/ad-label";
import { AdLink } from "@/features/advertising/components/ad-link";
import type { AdCreative, AdPlacementId } from "@/features/advertising/types";

/**
 * A sponsored card in a discovery grid.
 *
 * It shares the grid's rhythm but not its content contract: there are no
 * supporters, funding figures, or validation labels to confuse with an organic
 * result. The promoted surface, the label, and the closing sentence all say the
 * same thing.
 */
export function SponsoredContentCard({
  creative,
  placementId,
}: {
  creative: AdCreative;
  placementId: AdPlacementId;
}) {
  const headingId = `sponsored-${creative.id}-heading`;

  return (
    <AdInteraction
      className="h-full"
      creativeId={creative.id}
      placementId={placementId}
    >
      <article
        aria-labelledby={headingId}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand/35 bg-brand/[0.055] p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-2">
          <AdLabel advertiser={creative.advertiser} />
          <AdDismissButton creativeId={creative.id} />
        </div>

        <p className="mt-4 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand-strong">
          {creative.advertiser}
        </p>
        <h3
          id={headingId}
          className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.03em] text-ink"
        >
          {creative.headline}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-muted">
          {creative.body}
        </p>

        <div className="mt-auto pt-5">
          <AdLink
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface px-3.5 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            creativeId={creative.id}
            destination={creative.destination}
            placementId={placementId}
          >
            {creative.ctaLabel}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </AdLink>
          <p className="mt-3 border-t border-brand/15 pt-2.5 text-[0.625rem] leading-4 text-muted">
            Paid placement. It does not change organic ranking, validation
            signals, or funding figures.
          </p>
        </div>
      </article>
    </AdInteraction>
  );
}
