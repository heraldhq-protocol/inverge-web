import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { AdDismissButton } from "@/features/advertising/components/ad-dismiss-button";
import { AdInteraction } from "@/features/advertising/components/ad-interaction";
import { AdLabel } from "@/features/advertising/components/ad-label";
import { AdLink } from "@/features/advertising/components/ad-link";
import type { AdCreative, AdPlacementId } from "@/features/advertising/types";

/**
 * A wide sponsored banner for detail and editorial pages.
 *
 * It is placed after the decision-making content, never between the funding
 * panel and its figures. The border and label keep it visually distinct from an
 * Inverge call to action.
 */
export function SponsoredBanner({
  creative,
  placementId,
}: {
  creative: AdCreative;
  placementId: AdPlacementId;
}) {
  const headingId = `sponsored-${creative.id}-banner`;

  return (
    <AdInteraction creativeId={creative.id} placementId={placementId}>
      <aside
        aria-labelledby={headingId}
        className="rounded-2xl border border-brand/30 bg-brand-tint p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <AdLabel advertiser={creative.advertiser} />
          <AdDismissButton creativeId={creative.id} />
        </div>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2
              id={headingId}
              className="text-base font-bold tracking-[-0.025em] text-ink sm:text-lg"
            >
              {creative.headline}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {creative.body}
            </p>
          </div>
          <AdLink
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-surface px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            creativeId={creative.id}
            destination={creative.destination}
            placementId={placementId}
          >
            {creative.ctaLabel}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </AdLink>
        </div>

        <p className="mt-3 border-t border-brand/15 pt-2.5 text-[0.625rem] leading-4 text-muted">
          Sponsored by {creative.advertiser}. Paid placement never affects
          organic order or Inverge validation.
        </p>
      </aside>
    </AdInteraction>
  );
}
