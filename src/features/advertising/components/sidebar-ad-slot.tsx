import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

import { AdDismissButton } from "@/features/advertising/components/ad-dismiss-button";
import { AdInteraction } from "@/features/advertising/components/ad-interaction";
import { AdLabel } from "@/features/advertising/components/ad-label";
import { AdLink } from "@/features/advertising/components/ad-link";
import type { AdCreative, AdPlacementId } from "@/features/advertising/types";

/**
 * A sponsored card sized for a desktop rail.
 *
 * The rail already holds funding and verification cards; this component has the
 * same width and type scale but a different surface, a paid label, and no
 * Inverge metrics.
 */
export function SidebarAdSlot({
  creative,
  placementId,
}: {
  creative: AdCreative;
  placementId: AdPlacementId;
}) {
  const headingId = `sponsored-${creative.id}-rail`;

  return (
    <AdInteraction creativeId={creative.id} placementId={placementId}>
      <aside
        aria-labelledby={headingId}
        className="overflow-hidden rounded-2xl border border-brand/35 bg-surface"
      >
        <div className="h-1 bg-brand/70" aria-hidden="true" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <AdLabel advertiser={creative.advertiser} />
            <AdDismissButton creativeId={creative.id} />
          </div>

          <span
            aria-hidden="true"
            className="mt-4 flex size-9 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand-strong"
          >
            {creative.advertiser.slice(0, 1).toUpperCase()}
          </span>
          <h2
            id={headingId}
            className="mt-3 text-base font-bold leading-snug tracking-[-0.025em] text-ink"
          >
            {creative.headline}
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-muted">{creative.body}</p>

          <AdLink
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-brand/25 bg-brand-soft px-3 text-sm font-semibold text-brand-strong transition-colors hover:border-brand/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            creativeId={creative.id}
            destination={creative.destination}
            placementId={placementId}
          >
            {creative.ctaLabel}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </AdLink>
          <p className="mt-3 border-t border-border pt-2.5 text-[0.625rem] leading-4 text-muted">
            Paid placement by {creative.advertiser}. Not an Inverge
            recommendation.
          </p>
        </div>
      </aside>
    </AdInteraction>
  );
}
