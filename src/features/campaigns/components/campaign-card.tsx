import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, MapPinIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Cover } from "@/components/ui/cover";
import { PlanBadge } from "@/features/campaigns/components/campaign-status-pill";
import { CampaignFundingCard } from "@/features/campaigns/components/campaign-progress";
import { categoryLabel } from "@/features/campaigns/lib/filters";
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
 */
export function CampaignCard({
  campaign,
  nowIso,
  view = "grid",
  priority = false,
}: {
  campaign: Campaign;
  nowIso: string;
  view?: "grid" | "list";
  priority?: boolean;
}) {
  const isList = view === "list";
  const summary = fundingSummary(campaign);
  const willRun = planWillRun(campaign.phase);

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-ink/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:hover:translate-y-0 ${
        isList ? "sm:grid sm:grid-cols-[13rem_minmax(0,1fr)] sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-surface-muted ${
          isList ? "aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-44" : ""
        }`}
      >
        <Cover
          seed={campaign.slug}
          label={categoryLabel(campaign.category)}
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

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="truncate text-xs font-medium text-muted">
          {categoryLabel(campaign.category)}
        </p>
        <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.03em] text-ink">
          {campaign.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted">
          {campaign.summary}
        </p>

        <div className="mt-4 flex min-w-0 items-start gap-2.5">
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
    </Link>
  );
}
