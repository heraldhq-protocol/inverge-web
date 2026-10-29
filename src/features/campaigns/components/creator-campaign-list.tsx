import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  CheckListIcon,
  Flag02Icon,
  Megaphone01Icon,
  MoneyBag02Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Amount } from "@/components/ui/amount";
import { Cover } from "@/components/ui/cover";
import { Meter } from "@/components/ui/meter";
import { PhasePill } from "@/features/campaigns/components/campaign-status-pill";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { daysLeftLabel } from "@/features/campaigns/lib/filters";
import { campaignCategoryText } from "@/features/campaigns/lib/filters";
import { isPublicPhase } from "@/features/campaigns/lib/status";
import type { CreatorCampaignSummary } from "@/features/campaigns/types";
import { fundedRatio } from "@/features/campaigns/lib/amounts";
import type { MoneyAmount } from "@/lib/money";

/**
 * A creator's own campaign row.
 *
 * The primary link is the workspace, and the public page is offered only when the
 * campaign is actually public — a draft has no page to open, and a link to a 404
 * is worse than its absence. The raised figure is shown as "unavailable" rather
 * than zero when the indexer has not reported it (NFR-08), because "$0 raised" on
 * a campaign with a live funding window would be a false statement about money.
 */

function ProgressCell({ summary }: { summary: CreatorCampaignSummary }) {
  const ratio = summary.raised
    ? (fundedRatio(summary.raised, summary.target) ?? 0)
    : 0;

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-sm font-semibold tabular-nums text-ink">
          {summary.raised ? <Amount value={summary.raised} /> : "—"}
        </p>
        <p className="shrink-0 text-xs tabular-nums text-muted">
          of <Amount value={summary.target} />
        </p>
      </div>
      <Meter
        className="mt-1.5"
        ratio={ratio}
        cap={false}
        srLabel={`Raised ${Math.round(ratio * 100)} percent of the funding target`}
      />
      <p className="mt-1 text-[0.6875rem] leading-4 text-muted">
        {summary.raised === null
          ? "The indexer has not reported this campaign's total yet."
          : summary.phase === "funding"
            ? daysLeftLabel(summary.closesAt, new Date())
            : `Funding closed ${formatShortDate(summary.closesAt)}`}
      </p>
    </div>
  );
}

export function CreatorCampaignCard({
  summary,
  now,
}: {
  summary: CreatorCampaignSummary;
  now: Date;
}) {
  const links: { href: string; icon: IconSvgElement; label: string }[] = [
    {
      href: `/d/creator/campaigns/${summary.campaignId}`,
      icon: Flag02Icon,
      label: "Workspace",
    },
    {
      href: `/d/creator/campaigns/${summary.campaignId}/milestones`,
      icon: CheckListIcon,
      label: "Milestones",
    },
    {
      href: `/d/creator/campaigns/${summary.campaignId}/edit`,
      icon: Megaphone01Icon,
      label: "Edit",
    },
  ];

  if (isPublicPhase(summary.phase)) {
    links.push({
      href: `/campaigns/${summary.slug}`,
      icon: ArrowUpRight01Icon,
      label: "Public page",
    });
  }

  return (
    <li className="rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-brand/25 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
          <Cover
            seed={summary.slug}
            label={campaignCategoryText(summary)}
            src={summary.cover}
            ratio="thumbnail"
            size="lane"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PhasePill phase={summary.phase} size="xs" />
            <span className="text-xs text-muted">
              {campaignCategoryText(summary)}
            </span>
            <span aria-hidden="true" className="text-xs text-muted">
              ·
            </span>
            <span className="text-xs text-muted">
              {summary.publishedAt
                ? `Published ${formatShortDate(summary.publishedAt)}`
                : "Not published"}
            </span>
          </div>

          <h3 className="mt-1.5 text-base font-bold leading-snug text-ink">
            <Link
              href={`/d/creator/campaigns/${summary.campaignId}`}
              className="rounded hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {summary.title}
            </Link>
          </h3>

          {summary.reviewNote ? (
            <p className="mt-2 rounded-xl border border-warning/30 bg-warning/[0.07] px-3 py-2 text-xs leading-5 text-ink">
              <span className="font-semibold">Review note: </span>
              {summary.reviewNote}
            </p>
          ) : null}

          <p className="mt-2 text-sm leading-6 text-muted">
            <span className="font-semibold text-ink">Next: </span>
            {summary.nextAction}
          </p>

          <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
            <ProgressCell summary={summary} />

            <dl className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <dd className="truncate text-sm font-semibold tabular-nums text-ink">
                  {summary.backerCount === null
                    ? "—"
                    : summary.backerCount.toLocaleString("en-GB")}
                </dd>
                <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
                  Backers
                </dt>
              </div>
              <div className="min-w-0">
                <dd className="truncate text-sm font-semibold tabular-nums text-ink">
                  {summary.milestoneProgress
                    ? `${summary.milestoneProgress.released} of ${summary.milestoneProgress.total}`
                    : "—"}
                </dd>
                <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
                  Tranches released
                </dt>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
        {links.map(({ href, icon, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <HugeiconsIcon
                icon={icon}
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-muted"
              />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <span className="sr-only">Updated at {now.toISOString()}.</span>
    </li>
  );
}

export function CreatorCampaignList({
  summaries,
  emptyAction,
  now,
}: {
  summaries: readonly CreatorCampaignSummary[];
  emptyAction: React.ReactNode;
  now: Date;
}) {
  if (summaries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-10 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={MoneyBag02Icon}
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <p className="mt-3 text-base font-bold text-ink">No campaigns yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
          A campaign opens a funding window with a milestone plan that escrow
          enforces. Draft it first, then submit it for review.
        </p>
        <div className="mt-4 flex justify-center">{emptyAction}</div>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {summaries.map((summary) => (
        <CreatorCampaignCard
          key={summary.campaignId}
          summary={summary}
          now={now}
        />
      ))}
    </ul>
  );
}

/** The metric tiles shared by the campaign list and a campaign's workspace. */
export function creatorCampaignMetrics({
  active,
  needsAttention,
  releasedTranches,
  totalRaised,
}: {
  active: number;
  needsAttention: number;
  releasedTranches: number;
  totalRaised: MoneyAmount;
}): readonly {
  icon: IconSvgElement;
  label: string;
  value: ReactNode;
  hint: string;
}[] {
  return [
    {
      hint: "Sum of indexed raised totals. Unindexed campaigns add nothing.",
      icon: MoneyBag02Icon,
      label: "Raised",
      value: <Amount value={totalRaised} />,
    },
    {
      hint: "Campaigns currently funding or delivering.",
      icon: TaskDone01Icon,
      label: "Active",
      value: active.toLocaleString("en-GB"),
    },
    {
      hint: "Milestones whose tranche has left escrow.",
      icon: CheckListIcon,
      label: "Released",
      value: releasedTranches.toLocaleString("en-GB"),
    },
    {
      hint: "Campaigns with a review decision waiting on you.",
      icon: Flag02Icon,
      label: "Needs you",
      value: needsAttention.toLocaleString("en-GB"),
    },
  ];
}
