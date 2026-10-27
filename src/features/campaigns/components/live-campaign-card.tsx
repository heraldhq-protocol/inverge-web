import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  MapPinIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Cover } from "@/components/ui/cover";
import { Meter } from "@/components/ui/meter";
import { Pill, type PillTone } from "@/components/ui/pill";
import type {
  LiveCampaign,
  LiveCampaignStatus,
} from "@/features/campaigns/server/live-campaigns";
import { campaignHref } from "@/features/campaigns/server/live-campaigns";
import { formatMoney } from "@/lib/money";

const STATUS_TONES: Readonly<Record<LiveCampaignStatus, PillTone>> = {
  active: "accent",
  completed: "neutral",
  failed: "danger",
  funded: "accent",
};

const DEADLINE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function deadlineLabel(value: string | null): string {
  if (!value) return "No deadline published";
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? `Deadline ${DEADLINE_FORMAT.format(parsed)}`
    : "No deadline published";
}

function milestoneLabel(milestones: LiveCampaign["milestones"]): string {
  if (milestones.total === 0) return "No milestones published";
  return `${milestones.released} of ${milestones.total} milestones released`;
}

/**
 * A live campaign card.
 *
 * Discovery and category grids link to the live campaign detail route. The
 * route resolves the campaign by its source idea slug (or id), so a card always
 * points at a page that exists. `href` is overridable for the rare surface that
 * wants to send a reader to the source idea instead.
 */
export function LiveCampaignCard({
  campaign,
  href = campaignHref(campaign),
}: {
  campaign: LiveCampaign;
  href?: string | null;
}) {
  const readLabel = href?.startsWith("/ideas/")
    ? "Read the source idea"
    : "View campaign";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-ink/6 motion-reduce:hover:translate-y-0">
      {href ? (
        <Link
          href={href}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="sr-only">
            {readLabel}: {campaign.title}
          </span>
        </Link>
      ) : null}

      <div className="pointer-events-none relative shrink-0 overflow-hidden bg-surface-muted">
        <Cover
          seed={campaign.id}
          label={campaign.taxonomyText}
          src={campaign.cover}
          ratio="thumbnail"
          size="grid"
          className="transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute right-3 top-3 z-10">
          <Pill tone={STATUS_TONES[campaign.status]} className="shadow-sm">
            {campaign.statusLabel}
          </Pill>
        </div>
      </div>

      <div className="pointer-events-none flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="min-w-0 truncate text-xs font-medium text-muted">
          {campaign.taxonomyText}
        </p>
        <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.03em] text-ink">
          {campaign.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted">
          {campaign.summary}
        </p>

        <div className="mt-4 flex min-w-0 items-start gap-2.5">
          <Avatar name={campaign.creator} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {campaign.creator}
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
          <div className="flex items-baseline justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold tabular-nums text-ink">
              {formatMoney(campaign.raised)}{" "}
              <span className="font-medium text-muted">
                / {formatMoney(campaign.target)}
              </span>
            </p>
            <p className="shrink-0 text-xs font-semibold tabular-nums text-brand-strong">
              {campaign.percentFunded}%
            </p>
          </div>
          <Meter
            className="mt-2"
            ratio={campaign.percentFunded / 100}
            srLabel={`Funding progress for ${campaign.title}`}
            size="sm"
            cap={false}
          />
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted">
            <span className="flex min-w-0 items-center gap-1">
              <HugeiconsIcon
                icon={Calendar03Icon}
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className="shrink-0"
              />
              <span className="truncate">
                {deadlineLabel(campaign.deadline)}
              </span>
            </span>
            <span className="shrink-0">
              {milestoneLabel(campaign.milestones)}
            </span>
          </div>
        </div>

        {href ? (
          <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-strong">
            {readLabel}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={13}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </p>
        ) : null}
      </div>
    </article>
  );
}
