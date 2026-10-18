import { HugeiconsIcon } from "@hugeicons/react";
import { MapPinIcon, Shield01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Cover } from "@/components/ui/cover";
import { Pill } from "@/components/ui/pill";
import { CampaignMediaCarousel } from "@/features/campaigns/components/campaign-media-carousel";
import { categoryLabel } from "@/features/campaigns/lib/filters";
import {
  PlanBadge,
  PhasePill,
} from "@/features/campaigns/components/campaign-status-pill";
import { planWillRun } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";
import { formatLongDate } from "@/features/campaigns/lib/dates";

/**
 * Campaign detail header.
 *
 * The artwork is the creator's media gallery, in their order, when they attached
 * any; otherwise the campaign's cover image; otherwise the branded placeholder.
 * A video is preferred at the top but never required, so a campaign with photos
 * only is not treated as incomplete. The creator's verification badge is labelled
 * ("Identity verified") rather than a bare tick, because "verified" alone does not
 * say what was verified.
 */
export function CampaignDetailHero({ campaign }: { campaign: Campaign }) {
  return (
    <div>
      {campaign.media.length > 0 ? (
        <CampaignMediaCarousel
          media={campaign.media}
          label={categoryLabel(campaign.category)}
          title={campaign.title}
          sizes="(min-width: 1024px) 640px, 100vw"
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface-muted">
          <Cover
            seed={campaign.slug}
            label={categoryLabel(campaign.category)}
            src={campaign.cover}
            ratio="thumbnail"
            size="featured"
          />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <PhasePill phase={campaign.phase} />
        <PlanBadge
          hasPlan={campaign.milestones.length >= 2}
          accepting={planWillRun(campaign.phase)}
        />
        <Link
          href={`/campaigns/categories/${campaign.category}`}
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Pill tone="neutral">{categoryLabel(campaign.category)}</Pill>
        </Link>
      </div>

      <h1 className="mt-3 text-balance text-3xl font-bold leading-[1.08] tracking-[-0.045em] text-ink sm:text-4xl lg:text-[2.75rem]">
        {campaign.title}
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
        {campaign.summary}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={campaign.creator.name} size={40} />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              {campaign.creator.name}
              {campaign.creator.identityVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-brand-strong">
                  <HugeiconsIcon
                    icon={Shield01Icon}
                    size={11}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Identity verified
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <HugeiconsIcon
                icon={MapPinIcon}
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              {campaign.location}
              {" · "}
              {campaign.creator.previousCampaigns === 1
                ? "1 previous campaign"
                : `${campaign.creator.previousCampaigns} previous campaigns`}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted">
          Funding closes{" "}
          <span className="font-semibold text-ink">
            {formatLongDate(campaign.funding.closesAt)}
          </span>
        </p>
      </div>
    </div>
  );
}
