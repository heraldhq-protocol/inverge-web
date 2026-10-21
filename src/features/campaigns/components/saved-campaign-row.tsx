import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  BookmarkOff02Icon,
  MapPinIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Cover } from "@/components/ui/cover";
import { CampaignFundingCard } from "@/features/campaigns/components/campaign-progress";
import { PhasePill } from "@/features/campaigns/components/campaign-status-pill";
import { campaignCategoryText } from "@/features/campaigns/lib/filters";
import type { Campaign } from "@/features/campaigns/types";

/**
 * One saved campaign.
 *
 * The row is not itself a link: it carries a remove control, and a button inside
 * an anchor is invalid. The title and the cover link out separately, so the
 * whole row is still reachable while the remove action stays its own target.
 */

function RemoveButton({
  disabled,
  onRemove,
  title,
}: {
  disabled: boolean;
  onRemove: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-sm font-semibold text-muted transition-colors hover:border-danger/40 hover:text-danger-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
    >
      <HugeiconsIcon
        icon={BookmarkOff02Icon}
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      {disabled ? "Removing" : "Remove"}{" "}
      <span className="sr-only">{title} from saved campaigns</span>
    </button>
  );
}

export function SavedCampaignRow({
  campaign,
  nowIso,
  removing,
  onRemove,
}: {
  campaign: Campaign;
  nowIso: string;
  removing: boolean;
  onRemove: () => void;
}) {
  const href = `/campaigns/${campaign.slug}`;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:gap-5 sm:p-5">
      <Link
        href={href}
        className="shrink-0 overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-48"
      >
        <Cover
          seed={campaign.slug}
          label={campaignCategoryText(campaign)}
          src={campaign.cover}
          ratio="thumbnail"
          size="grid"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <PhasePill phase={campaign.phase} />
        </div>

        <h3 className="mt-2 text-base font-bold leading-snug tracking-[-0.025em] text-ink sm:text-lg">
          <Link
            href={href}
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand hover:text-brand-strong"
          >
            {campaign.title}
          </Link>
        </h3>

        <div className="mt-2 flex min-w-0 items-center gap-2">
          <Avatar name={campaign.creator.name} size={32} />
          <p className="min-w-0 truncate text-xs text-muted">
            {campaign.creator.name}
            {" · "}
            <span className="inline-flex items-center gap-0.5 align-middle">
              <HugeiconsIcon
                icon={MapPinIcon}
                size={12}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              {campaign.location}
            </span>
          </p>
        </div>

        <div className="mt-3 max-w-sm">
          <CampaignFundingCard campaign={campaign} nowIso={nowIso} />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
        <Link
          href={href}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View campaign
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
        <RemoveButton
          disabled={removing}
          onRemove={onRemove}
          title={campaign.title}
        />
      </div>
    </li>
  );
}

/**
 * A saved id that no longer resolves to a public campaign.
 *
 * Shown rather than silently dropped, because a saved row vanishing without
 * explanation reads as a bug. The remove control is the only action that makes
 * sense against something that is no longer there.
 */
export function SavedCampaignUnavailableRow({
  campaignId,
  removing,
  onRemove,
}: {
  campaignId: string;
  removing: boolean;
  onRemove: () => void;
}) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-canvas p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          Unavailable
        </p>
        <h3 className="mt-1 text-base font-bold tracking-[-0.02em] text-ink">
          This campaign is no longer public
        </h3>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">
          The campaign you saved is no longer listed for public reading. It may
          have been unpublished, or it may not have reached publication.
        </p>
        <p className="mt-2 text-xs text-muted">Saved reference {campaignId}</p>
      </div>

      <RemoveButton
        disabled={removing}
        onRemove={onRemove}
        title="this campaign"
      />
    </li>
  );
}
