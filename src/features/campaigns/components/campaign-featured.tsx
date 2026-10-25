import Link from "next/link";

import { Cover } from "@/components/ui/cover";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  PlanBadge,
  PhasePill,
} from "@/features/campaigns/components/campaign-status-pill";
import { CampaignFundingCard } from "@/features/campaigns/components/campaign-progress";
import {
  campaignCategoryText,
  campaignTaxonomyText,
} from "@/features/campaigns/lib/filters";
import type { Campaign } from "@/features/campaigns/types";

/**
 * The featured band.
 *
 * "Featured" is an editorial designation stored on the campaign (FR-206a); it is
 * never derived from how well a campaign is doing. The band carries the same
 * status and same funding block as a card, so the promotion cannot hide a
 * campaign's actual position.
 */
export function CampaignFeaturedBand({
  campaign,
  headingId = "featured-campaign-heading",
  nowIso,
}: {
  campaign: Campaign;
  /** Unique per slide when several featured campaigns share a carousel. */
  headingId?: string;
  nowIso: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="grid items-stretch gap-0 lg:grid-cols-[1.05fr_1fr]">
        <div className="order-2 flex flex-col p-5 sm:p-7 lg:order-1 lg:p-9">
          <Eyebrow>Featured campaign</Eyebrow>
          <h2
            id={headingId}
            className="mt-2.5 text-balance text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl"
          >
            {campaign.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {campaign.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <PhasePill phase={campaign.phase} />
            <span className="text-xs text-muted">
              {campaignTaxonomyText(campaign)} · {campaign.location}
            </span>
          </div>

          <div className="mt-5 max-w-sm rounded-2xl border border-border bg-canvas p-4">
            <CampaignFundingCard campaign={campaign} nowIso={nowIso} />
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
            <Link
              href={`/campaigns/${campaign.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View campaign
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <PlanBadge
                hasPlan={campaign.milestones.length >= 2}
                accepting
                size="sm"
              />
              <span>
                {campaign.milestones.length} published tranches, released on
                approved evidence
              </span>
            </span>
          </div>
        </div>

        <div className="relative order-1 min-h-56 min-w-0 lg:order-2 lg:min-h-full">
          <Cover
            seed={campaign.slug}
            label={campaignCategoryText(campaign)}
            src={campaign.cover}
            ratio="thumbnail"
            size="featured"
            className="h-full min-h-56 lg:min-h-full [&>div]:h-full"
          />
        </div>
      </div>
    </section>
  );
}
