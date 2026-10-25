import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, MapPinIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Cover } from "@/components/ui/cover";
import { CampaignSaveButton } from "@/features/campaigns/components/campaign-save-button";
import { PlanBadge } from "@/features/campaigns/components/campaign-status-pill";
import { CampaignFundingCard } from "@/features/campaigns/components/campaign-progress";
import {
  campaignCategoryText,
  campaignTaxonomyText,
} from "@/features/campaigns/lib/filters";
import { fundingSummary } from "@/features/campaigns/lib/funding";
import { planWillRun } from "@/features/campaigns/lib/status";
import type { Campaign } from "@/features/campaigns/types";

/**
 * A campaign in a discovery result.
 *
 * The card shows the funding state or the reason there is none, and never a
 * substitute figure for a total it does not have. The creator's verification is
 * a labelled badge rather than a bare tick, so "verified" always says what was
 * verified.
 *
 * The whole primary area navigates through one stretched link. The save control
 * is a sibling above that link, not a button inside it: nested interactive
 * elements are invalid HTML and break keyboard and screen-reader navigation.
 */
export function CampaignCard({
  campaign,
  nowIso,
  view = "grid",
  priority = false,
  recommendationReason,
}: {
  campaign: Campaign;
  nowIso: string;
  view?: "grid" | "list";
  priority?: boolean;
  /** Why this card is in a recommendation list, stated in plain language. */
  recommendationReason?: string | undefined;
}) {
  const isList = view === "list";
  const summary = fundingSummary(campaign);
  const willRun = planWillRun(campaign.phase);

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-ink/6 motion-reduce:hover:translate-y-0 ${
        isList
          ? "sm:grid sm:grid-cols-[13rem_minmax(0,1fr)] sm:flex-row"
          : "flex flex-col"
      }`}
    >
      <Link
        href={`/campaigns/${campaign.slug}`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="sr-only">View {campaign.title}</span>
      </Link>

      <div
        className={`pointer-events-none relative shrink-0 overflow-hidden bg-surface-muted ${
          isList ? "aspect-16/10 sm:aspect-auto sm:h-full sm:min-h-44" : ""
        }`}
      >
        <Cover
          seed={campaign.slug}
          label={campaignCategoryText(campaign)}
          src={campaign.cover}
          ratio="thumbnail"
          size={priority ? "featured" : "grid"}
          className="transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute right-3 top-3">
          <PlanBadge
            hasPlan={campaign.milestones.length >= 2}
            accepting={willRun}
            className="bg-surface/95 shadow-sm backdrop-blur"
          />
        </div>

        <div className="absolute left-3 bottom-4 z-20">
          <CampaignSaveButton
            campaign={{
              id: campaign.id,
              slug: campaign.slug,
              title: campaign.title,
            }}
            variant="icon"
          />
        </div>

        {summary.kind === "available" ? (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-ink/20">
            <span
              className="block h-full bg-brand"
              style={{ width: `${Math.min(1, summary.ratio) * 100}%` }}
            />
          </span>
        ) : null}
        <span
          aria-hidden="true"
          className="absolute bottom-4 right-3 grid size-8 place-items-center rounded-full bg-surface/95 text-ink shadow-sm transition-colors group-hover:bg-brand group-hover:text-white"
        >
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            strokeWidth={1.9}
          />
        </span>
      </div>

      <div className="pointer-events-none flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate text-xs font-medium text-muted">
            {campaignTaxonomyText(campaign)}
          </p>
          {recommendationReason ? (
            <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-brand-strong">
              {recommendationReason}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.03em] text-ink">
          {campaign.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted">
          {campaign.summary}
        </p>

        <div className="py-4 flex min-w-0 items-start gap-2.5">
          <Avatar name={campaign.creator.name} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {campaign.creator.name}
            </p>
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted">
              <HugeiconsIcon
                icon={MapPinIcon}
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className="shrink-0"
              />
              <span className="truncate">{campaign.location}</span>
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-border pt-4">
          <CampaignFundingCard campaign={campaign} nowIso={nowIso} />
        </div>
      </div>
    </article>
  );
}
